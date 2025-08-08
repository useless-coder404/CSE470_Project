// middleware/twoFAEnforce.js

const twoFAEnforce = (req, res, next) => {
  // Here req.user is populated by JWT auth middleware decoding token

  if (req.user.isTwoFAEnabled && !req.user.isTwoFAVerified) {
  return res.status(403).json({ message: '2FA verification required.' });
}
  next();
};

module.exports = twoFAEnforce;
