const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../models/tourModel");
const path = require("path");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful!!"))
  .catch((err) => console.log(`Database Error: ${err}`));

console.log("Reading Tours data from json file!");

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/simple-tours.json"))
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data added successfully!");
  } catch (err) {
    console.log(`Data Error: ${err}`);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data deleted successfully!");
  } catch (err) {
    console.log(`Data Error: ${err}`);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

