const twoFAEnforce = (req, res, next) => {
   if (req.user.isTwoFAEnabled && !req.user.isTwoFAVerified) { // Here req.user is populated by JWT auth middleware decoding token
    return res.status(403).json({ message: '2FA verification required.' });
  }
  next();
};

module.exports = twoFAEnforce;
