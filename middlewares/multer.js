const multer = require('multer');
const path = require("path");

const fileFilter = (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);

    } else {
        cb(new Error("Invalid file type"), false);
    }
};

// === 1. Multer for Doctor Documents ===
const doctorStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/docs'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    },
});

const uploadDoctorDocs = multer({ storage: doctorStorage, fileFilter });

// === 2. Multer for Prescriptions ===
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


module.exports = { uploadDoctorDocs, uploadPrescription};