const Tesseract = require("tesseract.js");
const axios = require("axios");
const path = require("path");
const { fromPath } = require("pdf2pic");
const fs = require("fs");
const { createNotification } = require("./notificationController");
const Prescription = require("../models/Prescription");


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

const extractPrescriptionText = async (req, res) => {
  let tempFilePath = null;
  try {
    let imagePath = "";

    // Uploaded file
    if (req.file) {
      const file = req.file;

      if (file.mimetype === "application/pdf") {
        const options = {
          density: 150,
          saveFilename: `ocr_${Date.now()}`,
          savePath: "./uploads/temp",
          format: "png",
          width: 1200,
          height: 1600,
        };
        fs.mkdirSync(options.savePath, { recursive: true });

        const convert = fromPath(file.path, options);
        const result = await convert(1); // first page
        imagePath = result.path;
      } else {
        imagePath = file.path;
      }

    // URL file
    } else if (req.query.url) {
      const url = req.query.url;
      const extension = path.extname(url).split("?")[0] || ".jpg";
      tempFilePath = `./uploads/temp/temp_ocr_${Date.now()}${extension}`;
      fs.mkdirSync("./uploads/temp", { recursive: true });

      if (url.startsWith("http")) {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(tempFilePath, response.data);
        imagePath = tempFilePath;
      } else if (fs.existsSync(url)) {
        imagePath = url;
      } else {
        return res.status(400).json({ message: "Invalid file path or URL provided" });
      }

    } else {
      return res.status(400).json({ message: "No file uploaded or URL provided" });
    }

    // OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

    // Cleanup temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    res.status(200).json({ text });

  } catch (error) {
    console.error("OCR error:", error);
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    res.status(500).json({ message: "OCR failed", error: error.message });
  }
};

module.exports = { uploadPrescriptionController, extractPrescriptionText, };