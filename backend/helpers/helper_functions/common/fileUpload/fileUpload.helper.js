const path = require("path");
const httpErrors = require("http-errors");

const saveFilesToDisk = (files) => {
  try {
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

module.exports = { saveFilesToDisk };
