import express, { NextFunction } from "express";
import "dotenv/config";
import { connectToDatabase } from "./services/database.service";
import userRouter from "./routes/user.route";
import { defaultHandlerError } from "./middleware/handle.error.middleware";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8088;
app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ chấp nhận yêu cầu từ nguồn này
    methods: "GET,PUT,POST,DELETE", // Chỉ chấp nhận các phương thức được liệt kê
    allowedHeaders: "Content-Type,Authorization", // Chỉ chấp nhận các header được liệt kê
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectToDatabase();
app.use("/account", userRouter);
app.use(defaultHandlerError);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
