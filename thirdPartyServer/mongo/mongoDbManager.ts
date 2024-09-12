import mongoose, {Model} from "mongoose";
import * as dotenv from 'dotenv';

dotenv.config();

const setUpMongo = () => {
  const { DB_CONNECTION_STR = "mongodb+srv://safethedate:safethedate2023@safethedate.ylhxzwn.mongodb.net/?retryWrites=true&w=majority" } = process.env;

  mongoose.connect(DB_CONNECTION_STR);
  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Connected successfully");
  });
}

export default setUpMongo;
