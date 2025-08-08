const { fromPath } = require("pdf2pic");
const Tesseract = require("tesseract.js");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const Prescription = require("../models/Prescription");
const { createNotification } = require("./notificationController");

// Upload prescription with file and optional description
const uploadPrescriptionController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const fileUrl = `/uploads/prescriptions/${req.file.filename}`;

    const newPrescription = new Prescription({
      patientId: userId,
      fileUrl,
      description,
    });

    await newPrescription.save();

    // Send user notification
    await createNotification(
      userId,
      "Prescription Uploaded",
      "Your prescription has been uploaded successfully.",
      "prescription"
    );

    res.status(201).json({
      status: "success",
      message: "Prescription uploaded successfully",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Prescription upload error:", error);
    res
      .status(500)
      .json({ message: "Server error while uploading prescription" });
  }
};

// OCR extract from file upload or public/local URL
const extractPrescriptionText = async (req, res) => {
  try {
    let imagePath = "";
    let tempFilePath = null;

    if (req.file) {
      const file = req.file;

      if (file.mimetype === "application/pdf") {
        const options = {
          density: 100,
          saveFilename: "converted",
          savePath: "./uploads/prescriptions",
          format: "png",
          width: 600,
          height: 800,
        };

        const convert = fromPath(file.path, options);
        const result = await convert(1);
        imagePath = result.path;
      } else {
        imagePath = file.path;
      }
    } else if (req.query.url) {
      const url = req.query.url;

      if (url.startsWith("http://") || url.startsWith("https://")) {
        // Remote file (e.g. image or PDF URL)
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const extension = path.extname(url).split("?")[0] || ".jpg";
        tempFilePath = `./uploads/temp_ocr${extension}`;
        fs.writeFileSync(tempFilePath, response.data);
        imagePath = tempFilePath;
      } else if (fs.existsSync(url)) {
        // Local file path
        imagePath = url;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid file path or URL provided" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "No file uploaded or URL provided" });
    }

    // Run OCR on extracted or uploaded image
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng");

    // Cleanup temp file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ message: "OCR failed", error: error.message });
  }
};

module.exports = {
  uploadPrescriptionController,
  extractPrescriptionText,
};
