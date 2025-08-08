const { body, query, param } = require('express-validator');

const sanitizeProfileUpdate = [
  body('*').escape().trim(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('name').optional().isLength({ min: 2 }).withMessage('Name too short'),

  // Additional validations for doctor profile update fields
  body('specialty').optional().isString().withMessage('Specialty must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('fees').optional().isNumeric().withMessage('Fees must be a number'),
  body('experience').optional().isNumeric().withMessage('Experience must be a number'),

  // clinicLocation validation with custom check
  body('clinicLocation').optional().custom(value => {
    if (typeof value !== 'object' || value.type !== 'Point' || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
      throw new Error('Invalid clinicLocation format');
    }
    if (typeof value.coordinates[0] !== 'number' || typeof value.coordinates[1] !== 'number') {
      throw new Error('clinicLocation.coordinates must be an array of two numbers');
    }
    return true;
  }),

  // availability should be an array
  body('availability').optional().isArray().withMessage('Availability must be an array'),
  // Optional: You can add nested validation for availability array elements here if needed
];

const sanitizeSearch = [
  query('*').escape().trim()
];

const sanitizeHealthLog = [
  body('*').escape().trim(),
  body('title').optional().isLength({ min: 2 }).withMessage('Title too short'),
  body('description').optional().isLength({ min: 5 }).withMessage('Description too short')
];

const sanitizeReminder = [
  body('*').escape().trim(),
  body('title').optional().isLength({ min: 2 }).withMessage('Title too short'),
  body('time').optional().isISO8601().withMessage('Invalid date/time format')
];

module.exports = { sanitizeProfileUpdate, sanitizeHealthLog, sanitizeReminder, sanitizeSearch };
