const asyncHandler = require('express-async-handler');
const dayjs = require('dayjs');
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const AuditLog = require('../models/AuditLog');
const sanitizeInput = require('../utils/sanitizeInput');


const uploadDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        console.log("Received file:", file);

        if (!file) {
            return res.status(400).json({ message: "No document uploaded" });
        }

        // Find or create doctor profile
        let profile = await DoctorProfile.findOne({ userId: userId });

        
        if (!profile) {
            profile = new DoctorProfile({ userId: userId, documents: [] });
        }
        
        // Add uploaded document
        profile.documents.push({
            filename: file.filename,
            filetype: file.mimetype,
            status: "Pending"
        });
        
        await profile.save();
        
        // Update User: set verificationStatus = Pending
        await User.findByIdAndUpdate(userId, { verificationStatus: "Pending" });
        
        // After creating DoctorProfile
        await User.findByIdAndUpdate(userId, { doctorProfile: profile._id });


        
        res.status(200).json({ message: "Document uploaded and pending verification" });
    
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getPublicDoctors = async (req, res) => {
    try {
        const { name, specialty, location } = req.query;
        
        const query = {
            role: "doctor",
            verificationStatus: "Verified",
            isBlocked: false,
        };
        
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        
        if (location) {
            query["DoctorProfile.clinicLocation"] = { $regex: location, $options: "i" };
        }
        
        if (specialty) {
            query["DoctorProfile.specialty"] = { $regex: specialty, $options: "i" };
        }
        
        const doctors = await User.find(query).select("-password -otpToken -twoFASecret").populate({
            path: "DoctorProfile",
            select: "specialty bio clinicLocation phone rating experience availability",
        });
        
        res.status(200).json({
            status: "success",
            results: doctors.length,
            doctors,
        });
    
    } catch (error) {
        console.error("Doctor public listing error:", error);
        res.status(500).json({ status: "error", message: "Failed to load doctors" });
    }
};

const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  if ('email' in req.body || 'role' in req.body) {
    return res.status(400).json({
      status: 'fail',
      errors: [{ msg: "Email and role cannot be updated" }]
    });
  }

  const allowedFields = [
    'specialty', 'bio', 'phone', 'clinicLocation',
    'experience', 'fees', 'availability'
  ];

  const updates = {};

  for (let field of allowedFields) {
    if (field === 'clinicLocation' && req.body.clinicLocation) {
      const loc = req.body.clinicLocation;

      if (
        typeof loc !== 'object' ||
        loc.type !== 'Point' ||
        !Array.isArray(loc.coordinates) ||
        loc.coordinates.length !== 2 ||
        typeof loc.coordinates[0] !== 'number' ||
        typeof loc.coordinates[1] !== 'number'
      ) {
        return res.status(400).json({
          status: 'fail',
          errors: [{ msg: "Invalid clinicLocation format" }]
        });
      }

      updates['clinicLocation'] = {
        type: 'Point',
        coordinates: loc.coordinates,
      };

    } else if (field === 'availability' && req.body.availability) {
      const availability = req.body.availability;

      if (!Array.isArray(availability)) {
        return res.status(400).json({
          status: 'fail',
          errors: [{ msg: "Availability must be an array" }]
        });
      }

      for (let slot of availability) {
        if (
          !slot.day || !slot.startTime || !slot.endTime ||
          typeof slot.day !== 'string' ||
          typeof slot.startTime !== 'string' ||
          typeof slot.endTime !== 'string'
        ) {
          return res.status(400).json({
            status: 'fail',
            errors: [{ msg: "Invalid availability slot format" }]
          });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(slot.day)) {
          return res.status(400).json({
            status: 'fail',
            errors: [{ msg: "Invalid day in availability" }]
          });
        }

        if (
          dayjs(slot.startTime, 'HH:mm').isAfter(dayjs(slot.endTime, 'HH:mm'))
        ) {
          return res.status(400).json({
            status: 'fail',
            errors: [{ msg: "Start time must be before end time" }]
          });
        }
      }

      updates['availability'] = availability;

    } else if (req.body[field]) {
      updates[field] = sanitizeInput(req.body[field]);
    }
  }

  const updatedDoctor = await DoctorProfile.findOneAndUpdate(
    { userId: doctorId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  await AuditLog.create({
    action: 'Doctor Profile Updated',
    performedBy: doctorId,
    details: updates,
  });

  res.status(200).json({ message: "Profile updated", doctor: updatedDoctor });
});

const getNearbyDoctors = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                status: 'fail',
                message: 'Latitude and Longitude are required.',
            });
        }
        
        const distanceInMeters = radius * 1000; // convert km to meters
        
        const doctors = await DoctorProfile.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: distanceInMeters,
                },
            },
        }).populate({
            path: 'userId',
            match: { verificationStatus: 'Verified', isBlocked: false, role: 'doctor' },
            select: 'name email username',
        });

        // filter out entries with no populated user (not matching criteria)
        const filteredDoctors = doctors.filter((doc) => doc.userId);
        
        res.status(200).json({
            status: 'success',
            results: filteredDoctors.length,
            doctors: filteredDoctors,
        });
    } catch (error) {
        console.error('Geo error:', error);
        res.status(500).json({ status: 'fail', message: 'Geo search failed' });
    }
};

const searchDoctors = async (req, res) => {
    try {
        const { specialty, clinicLocation, name } = req.query;

        const query = {
            role: 'doctor',
            verificationStatus: 'Verified',
            isBlocked: false,
        };
        
        if (specialty) {
            query['DoctorProfile.specialty'] = { $regex: specialty, $options: 'i' };
        }
        
        if (name) {
            query['name'] = { $regex: name, $options: 'i' };
        }
        
        if (clinicLocation) {
            query['DoctorProfile.clinicLocation'] = { $regex: clinicLocation, $options: 'i' };
        }
        
        const doctors = await User.find(query).select('-password -otpToken').populate('doctorProfile');
        
        res.json({
            status: 'success',
            results: doctors.length,
            doctors,
        });
    
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


module.exports = { uploadDocument, getPublicDoctors, updateDoctorProfile, getNearbyDoctors, searchDoctors };

