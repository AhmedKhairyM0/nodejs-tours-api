// uncaughtException event to handle sync errors like console.log for undefined variables
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception 💥 Shuttting down...`);
  console.log(err);
  process.exit(1);
});

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" }); // this line must be up of the app require declaration becuase if app module uses .env
const app = require("./app");

// console.log(process.env.DATABASE_LOCAL)
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log("DB connection successful!"));
// .catch((err) => console.log(`DB Connection Error: ${err}`));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

/**
 * In development phase when there are unhandled errors, The server will shut down
 * but in production phase there are tools that will restart app again
 */
// unhandledRejection event to handle async errors like disconnection database
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection 💥 Shuttting down...`);
  console.log(err);
  // close server: finish any async functions | requests before exit process
  server.close(() => {
    process.exit(1);
  });
});

// MongoDB
// 1) Connecting -- to mongodb local | remote host
// 2) Schema
// 3) Model
// 4) CRUD operation in controllers
