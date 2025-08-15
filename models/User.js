const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        username: { 
            type: String, 
            required: true, 
            unique: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        password: { 
            type: String, 
            required: true 
        },
        age: {
            type: Number
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Others'],
            default: null
        },
        contact: {
            type: String
        },
        isEmailVerified: { 
            type: Boolean, 
            default: false 
        },
        role: { type: String, 
            enum: ['user', 'doctor', 'admin'], 
            default: 'user' 
        },
        otp: {
            type: String
        },
        otpExpiresAt: {
            type: Date
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationStatus: {
            type: String,
            enum: ['None', 'Pending', 'Verified', 'Rejected'],
            default: 'None',
        },
        isDoctorVerified: { 
            type: Boolean, 
            default: false 
        },
        isBlocked: { 
            type: Boolean, 
            default: false 
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
        new: {
            type: Boolean,
            default: false
        },
        runValidators: {
            type: Boolean,
            default: false
        },
        doctorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DoctorProfile",
        },
        recoveryCodes: [
            {
                code: String, 
                used: { type: Boolean, default: false }
            }
        ],
        isTwoFAEnabled: { 
            type: Boolean, 
            default: false 
        },
        isTwoFAVerified: {
            type: Boolean,
            default: false
        },
        twoFAToken: {
            type: String,
            default: null
        },
        twoFATokenExpires: {
            type: Date,
            default: null
        },
        twoFASetupPending: {
            type: Boolean,
            default: false
        },
    },

    { 
        timestamps: true 
    }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log("Comparing passwords...");
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpiresAt;
  delete user.twoFAToken;
  delete user.twoFATokenExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);