const asyncHandler = require("express-async-handler");
const httpErrors = require("http-errors");
const path = require("path");
const crypto = require("crypto");

const filePayloadExists = asyncHandler(async (req, res, next) => {
  if (!req.files)
    throw httpErrors.BadRequest("Product image files are missing");
  next();
});

const fileExtensionLimiter = asyncHandler(async (req, res, next) => {
  const files = req.files?.images;
  if (files) {
    const allowedExtensions = process.env.ALLOWED_FILE_EXTENSIONS.split(" ");
    const fileExtensions = [];
    if (files?.length >= 1) {
      Object.keys(files).forEach((key) => {
        fileExtensions.push(path.extname(files[key].name));
      });
    } else {
      fileExtensions.push(path.extname(files.name));
    }
    const allowed = fileExtensions.every((extension) =>
      allowedExtensions.includes(extension)
    );
    if (!allowed) {
      throw httpErrors.UnprocessableEntity(
        `Invalid file format. Only ${allowedExtensions.toString()} files are allowed`
      );
    }
  }
  next();
});

const filenameMiddleware = asyncHandler(async (req, res, next) => {
  const files = req.files?.images;
  if (files) {
    if (files?.length >= 1) {
      Object.keys(files).forEach((key) => {
        let newName = crypto.randomUUID().toString();
        let ext = path.extname(files[key].name);
        files[key].name = `${newName}${ext}`;
      });
    } else {
      let newName = crypto.randomUUID().toString();
      let ext = path.extname(files.name);
      files.name = `${newName}${ext}`;
    }
  }
  next();
});

module.exports = {
  filePayloadExists,
  fileExtensionLimiter,
  filenameMiddleware,
};
