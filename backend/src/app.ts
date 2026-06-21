import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Bienvenue sur l'API SmartCaravan",
    status: "success",
    version: "1.0.0"
  });
});

export default app;
