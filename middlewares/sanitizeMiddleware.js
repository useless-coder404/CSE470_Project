const { body, query, param } = require('express-validator');

const sanitizeProfileUpdate = [
  //General Fields
  body('name').optional().escape().trim().isLength({ min: 2 }).withMessage('Name too short'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().escape().trim().isMobilePhone().withMessage('Invalid phone number'),
  body('specialty').optional().escape().trim().isString().withMessage('Specialty must be a string'),
  body('bio').optional().escape().trim().isString().withMessage('Bio must be a string'),
  body('fees').optional().isNumeric().withMessage('Fees must be a number'),
  body('experience').optional().isNumeric().withMessage('Experience must be a number'),

  // ClinicLocation Validation
  body('clinicLocation').optional().custom(value => {
    if (
      typeof value !== 'object' ||
      value.type !== 'Point' ||
      !Array.isArray(value.coordinates) ||
      value.coordinates.length !== 2 ||
      typeof value.coordinates[0] !== 'number' ||
      typeof value.coordinates[1] !== 'number'
    ) {
      throw new Error('Invalid clinicLocation format');
    }
    return true;
  }),

  // Availability validation
  body('availability').optional().isArray().withMessage('Availability must be an array')
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
