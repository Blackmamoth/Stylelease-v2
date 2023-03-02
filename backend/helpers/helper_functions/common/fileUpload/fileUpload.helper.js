const httpErrors = require("http-errors");
const path = require("path");
const fs = require("fs");

const saveFilesToDisk = (files) => {
  try {
    const mediaPath = path.join(
      path.dirname(require.main.filename),
      "public",
      "media"
    );
    if (!fs.existsSync(mediaPath)) {
      fs.mkdir(mediaPath, { recursive: true }, (err) => {
        if (err) throw httpErrors.InternalServerError(err);
      });
    }
    if (files?.length) {
      Object.keys(files).forEach((key) => {
        const filepath = path.join(
          path.dirname(require.main.filename),
          "public",
          "media",
          files[key].name
        );
        files[key].mv(filepath, (error) => {
          if (error) throw httpErrors.InternalServerError(error);
        });
      });
    } else {
      const filepath = path.join(
        path.dirname(require.main.filename),
        "public",
        "media",
        files.name
      );
      files.mv(filepath, (error) => {
        if (error) throw httpErrors.InternalServerError(error);
      });
    }
  } catch (error) {
    throw httpErrors.InternalServerError(error);
  }
};

const removeFilesFromDisk = (files) => {
  try {
    files.forEach((file) => {
      const filePath = path.join(
        path.dirname(require.main.filename),
        "public",
        "media",
        file
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          throw httpErrors.InternalServerError(
            "An error occured while deleting images"
          );
        }
      });
    });
  } catch (error) {
    throw httpErrors.InternalServerError(error);
  }
};

module.exports = { saveFilesToDisk, removeFilesFromDisk };
