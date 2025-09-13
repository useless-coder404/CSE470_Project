const multer = require('multer');
const path = require("path");
const fs = require('fs');

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

//Profile Picture
const ProfileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/profile-pics');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + path.extname(file.originalname)); 
  }
});

const uploadProfilePicture = multer({ 
    storage: profileStorage, 
    fileFilter: ProfileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 * 10 } }); // max 5MB

// Doctor Document
const doctorStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../uploads/docs")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadDoctorDocs = multer({ storage: doctorStorage, fileFilter }).fields([
  { name: "idCard", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]);



// Prescription
const prescriptionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/prescriptions'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `presc-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    },
});

const uploadPrescription = multer({ storage: prescriptionStorage, fileFilter });


// Voice upload
const storageVoice = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/voice/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadVoice = multer({
    storage: storageVoice,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.mp3', '.wav', '.m4a'].includes(ext)) {
            return cb(new Error('Only audio files are allowed'));
        }
        cb(null, true);
    }
});


module.exports = { uploadProfilePicture, uploadDoctorDocs, uploadPrescription, uploadVoice};