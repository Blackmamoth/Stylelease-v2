require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db.config");
const colorette = require("colorette");
const PORT = process.env.PORT || 5000;

const app = express();

connectDB();
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/seller/auth", require("./routes/seller/auth/auth.router"));

app.listen(PORT, () =>
  console.log(
    colorette.cyan(colorette.bold(`Application running on port ${PORT}`))
  )
);
