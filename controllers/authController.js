const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const { addToBlacklist } = require('../utils/tokenBlacklist');
const generateRecoveryCodes = require('../utils/recoveryCode');


const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase().trim() }] });

    if (existingUser) {
      if (!existingUser.isVerified) {
        const now = new Date();
        if (existingUser.otpExpiresAt && existingUser.otpExpiresAt < now) {
          await User.deleteOne({ email });
        } else {
          return res.status(400).json({ message: 'Email is already in use. Please verify your OTP or wait for it to expire.' });
        }
      } else {
        return res.status(400).json({ message: 'Email is already registered.' });
      }
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new User({
      name,
      username,
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    await newUser.save();

    await sendEmail({
      to: newUser.email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It will expires in 5 minutes.`,
      html: `<h3>Welcome to Health Assistant</h3><p>Your OTP is: <b>${otp}</b></p>`,
    });

    res.status(201).json({
      success: true,
      message: 'User registered. Check your email for the OTP to verify your account.',
      userId: newUser._id,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({ message: 'Email, OTP, and role are required.' });
    }

    if (!['user', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }

    const now = new Date();
    if (user.otpExpiresAt < now) {
      return res.status(400).json({ message: 'OTP has expired. Please register again or request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.role = role;
    user.isVerified = true;
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    if (role === 'doctor') {
      user.verificationStatus = 'Pending'; // doctor's verification is pending
    }

    await AuditLog.create({
      action: 'OTP Verified',
      performedBy: user._id,
      details: { email: user.email, role: user.role },
    });

    await user.save();

    // Send welcome/status email
    if (role === 'user') {
      await sendEmail({
        to: user.email,
        subject: 'Registration Successful',
        text: `Welcome to our platform, ${user.name}! Your registration is now complete.`,
        html: `<p>Welcome to our platform <strong>${user.name}</strong>! Your registration is now complete.</p>`,
      });
    } else if (role === 'doctor') {
      await sendEmail({
        to: user.email,
        subject: 'Registration Status',
        text: `Welcome to our platform, ${user.name}! Your registration is now at pending, wait for verification.`,
        html: `<p>Welcome to our platform <strong>${user.name}</strong>! Your registration is now at pending, wait for verification.</p>`,
      });
    }

    res.status(200).json({
      message: 'OTP verified and role locked successfully.',
      redirect: role === 'doctor' ? '/upload-documents' : '/login',
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrusername, password } = req.body;

    if (!emailOrusername || !password) {
      return res.status(400).json({ message: 'Email/Username and password required.' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrusername.toLowerCase().trim() }, { username: emailOrusername }],
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.isTwoFAEnabled) {
      // Generate and send OTP for 2FA
      const otp = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.twoFAToken = otp;
      user.twoFATokenExpires = expires;
      await user.save();

      await sendEmail({
        to: user.email,
        subject: 'Your 2FA One-Time Password',
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      });

      await AuditLog.create({
        action: 'Sent 2FA OTP on login',
        performedBy: user._id,
        details: { email: user.email },
      });

      // Temporary token
      const tempPayload = {
        id: user._id,
        role: user.role,
        email: user.email,
        isTwoFAVerified: false,
      };

      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET, { expiresIn: '10m' });

      return res.status(200).json({
        message: '2FA OTP sent. Please verify to continue.',
        token: tempToken,
      });
    } else {
      // 2FA not enabled, issue normal token with isTwoFAVerified: true
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
          isTwoFAVerified: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Allow verification if 2FA is enabled OR setup is pending
    if (!user.isTwoFAEnabled && !user.twoFASetupPending) {
      return res.status(400).json({ message: '2FA is not enabled for this user.' });
    }

    if (!user.twoFAToken || !user.twoFATokenExpires || user.twoFATokenExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired or invalid.' });
    }

    if (user.twoFAToken !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    // Clear token and expiry after successful verification
    user.twoFAToken = null;
    user.twoFATokenExpires = null;

    // If it was setup pending, now fully enable 2FA
    if (user.twoFASetupPending) {
      user.twoFASetupPending = false;
      user.isTwoFAEnabled = true;
    }

    await user.save();

    await AuditLog.create({
      action: 'Verified 2FA OTP',
      performedBy: user._id,
      details: { email: user.email },
    });

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      isTwoFAVerified: true,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: '2FA verified successfully.',
      token,
    });
  } catch (err) {
    console.error('2FA verification error:', err);
    return res.status(500).json({ message: 'Error verifying 2FA.' });
  }
};

const verifyRecoveryCode = async (req, res) => {
  try {
    const { recoveryCode } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.isTwoFAEnabled) return res.status(400).json({ message: '2FA not enabled.' });

    let matchedIndex = -1;
    for (let i = 0; i < user.recoveryCodes.length; i++) {
      const rc = user.recoveryCodes[i];
      if (!rc.used && (await bcrypt.compare(recoveryCode, rc.code))) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      return res.status(401).json({ message: 'Invalid recovery code.' });
    }

    user.recoveryCodes[matchedIndex].used = true;
    await user.save();

    await AuditLog.create({
      action: 'Used recovery code for 2FA bypass',
      performedBy: user._id,
      details: { email: user.email },
    });

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      isTwoFAVerified: true,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({ message: 'Recovery code accepted.', token });
  } catch (err) {
    console.error('Recovery code verify error:', err);
    return res.status(500).json({ message: 'Error verifying recovery code.' });
  }
};

const regenerateRecoveryCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.isTwoFAEnabled) return res.status(400).json({ message: '2FA is not enabled.' });

    const newCodesRawAndHashed = await generateRecoveryCodes();

    user.recoveryCodes = newCodesRawAndHashed.map(({ hashedCode }) => ({
      code: hashedCode,
      used: false,
    }));

    await user.save();

    const rawCodes = newCodesRawAndHashed.map(({ rawCode }) => rawCode);

    await AuditLog.create({
      action: 'Regenerated 2FA recovery codes',
      performedBy: user._id,
      details: { email: user.email },
    });

    return res.status(200).json({
      message: 'Recovery codes regenerated. Save them securely; they will not be shown again.',
      recoveryCodes: rawCodes,
    });
  } catch (err) {
    console.error('Regenerate recovery codes error:', err);
    return res.status(500).json({ message: 'Error regenerating recovery codes.' });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    addToBlacklist(token);

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Logout failed.' });
  }
};


module.exports = { registerUser, verifyOTP, loginUser, verify2FA, verifyRecoveryCode, regenerateRecoveryCodes, logout, };