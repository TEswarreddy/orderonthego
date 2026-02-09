const fs = require("fs");
const path = require("path");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to convert file to base64
const fileToBase64 = (filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${data.toString("base64")}`;
  } catch (error) {
    console.error("Error converting file to base64:", error);
    return null;
  }
};

// Helper function to save image buffer to file
const saveImageBuffer = (buffer, fileName) => {
  try {
    const uploadsDir = path.join(__dirname, "../../uploads/profiles");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error("Error saving image buffer:", error);
    return null;
  }
};

// Helper function to delete old image
const deleteOldImage = (imagePath) => {
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error("Error deleting old image:", error);
  }
};

// Helper function to read image and return as base64 or buffer
const getImageData = (user) => {
  if (user.profileImageBuffer) {
    // If image is stored as buffer, convert to base64
    return `data:${user.profileImageMimeType || "image/jpeg"};base64,${user.profileImageBuffer.toString("base64")}`;
  }
  return null;
};

module.exports = {
  fileToBase64,
  saveImageBuffer,
  deleteOldImage,
  getImageData,
  uploadsDir,
};
