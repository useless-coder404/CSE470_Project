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
    const userRole = req.user.role || "user"; // default to user
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

    // Send notification to the user
    await createNotification({
      recipientId: userId,
      role: userRole,
      title: "Prescription Uploaded",
      message: "Your prescription has been uploaded successfully.",
      type: "prescription"
    });

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

const getPrescriptionsController = async (req, res) => {
  try {
    const userId = req.user._id;

    const prescriptions = await Prescription.find({ patientId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ prescriptions });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({ message: "Server error while fetching prescriptions" });
  }
};

const extractPrescriptionText = async (req, res) => {
  let tempFilePath = null;
  try {
    let imagePath = "";

    if (req.file) {
      const file = req.file;
      console.log("Uploaded file:", file.path, file.mimetype);

      if (file.mimetype === "application/pdf") {
        const options = {
          density: 300,          
          saveFilename: `ocr_${Date.now()}`,
          savePath: "./uploads/temp",
          format: "png",
          width: 2000,
          height: 2000,
        };
        fs.mkdirSync(options.savePath, { recursive: true });

        const convert = fromPath(file.path, options);
        const result = await convert(1); // first page
        imagePath = result.path;
        console.log("PDF converted to image at:", imagePath);
      } else {
        imagePath = file.path;
      }

    } else if (req.query.url) {
      const url = req.query.url;
      const extension = path.extname(url).split("?")[0] || ".jpg";
      tempFilePath = `./uploads/temp/temp_ocr_${Date.now()}${extension}`;
      fs.mkdirSync("./uploads/temp", { recursive: true });

      if (url.startsWith("http")) {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(tempFilePath, response.data);
        imagePath = tempFilePath;
        console.log("Downloaded URL to temp file:", imagePath);
      } else if (fs.existsSync(url)) {
        imagePath = url;
        console.log("Using existing local file:", imagePath);
      } else {
        return res.status(400).json({ message: "Invalid file path or URL provided" });
      }

    } else {
      return res.status(400).json({ message: "No file uploaded or URL provided" });
    }

    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({ message: "File does not exist at path: " + imagePath });
    }

    //ocr proccess
    console.log("Starting OCR on:", imagePath);
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
      logger: m => console.log("Tesseract:", m),
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()/- ",
    });

    console.log("OCR Result:", text.trim());

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Deleted temp file:", tempFilePath);
    }

    return res.status(200).json({ text: text.trim() });

  } catch (error) {
    console.error("OCR error:", error);
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return res.status(500).json({ message: "OCR failed", error: error.message });
  }
};

module.exports = { uploadPrescriptionController, getPrescriptionsController, extractPrescriptionText };