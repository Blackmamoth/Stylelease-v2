const mongoose = require("mongoose");
const colorette = require("colorette");

const connectDB = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => {
        console.log(
          colorette.cyan(
            colorette.bold("Application connected to MongoDB Server")
          )
        );
      }
    );
  } catch (error) {
    console.log(
      colorette.red(
        colorette.bold("Error occured while connecting to MongoDB Server")
      )
    );
    process.exit(1);
  }
};

module.exports = { connectDB };
