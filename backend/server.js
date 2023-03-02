require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const httpErrors = require("http-errors");
const { connectDB } = require("./config/db.config");
const colorette = require("colorette");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();

connectDB();
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seller's auth routes
app.use("/seller/auth", require("./routes/seller/auth/auth.router"));

// Seller's inventory routes
app.use(
  "/seller/inventory",
  require("./routes/seller/inventory/inventory.route")
);

// Render media through the server
app.use(
  "/media/images",
  express.static(path.join(__dirname, "public", "media"))
);

app.use(async (req, res, next) => {
  next(httpErrors.NotFound(`Route not found for [${req.method}] ${req.url}`));
});

// Common error handler
app.use((error, req, res, next) => {
  const message =
    error?.message || `Cannot resolve request [${req.method}] ${req.url}`;
  if (res.headersSent === false) {
    res.send({
      error: true,
      data: {
        message,
      },
    });
  }
  next();
});

app.listen(PORT, () =>
  console.log(
    colorette.cyan(colorette.bold(`Application running on port ${PORT}`))
  )
);
