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
  .then((con) => console.log("DB connection successful!"))
  .catch((err) => console.log(`DB Connection Error: ${err}`));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

// MongoDB
// 1) Connecting -- to mongodb local | remote host
// 2) Schema
// 3) Model
// 4) CRUD operation in controllers
