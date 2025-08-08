const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Send first validation error message with details
    return res.status(400).json({
      status: 'fail',
      errors: errors.array().map(err => ({
        param: err.param,
        msg: err.msg
      })),
    });
  }
  next();
};

module.exports = validationHandler;
