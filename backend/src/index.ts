import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import routerAuth from "./routes/auth.Routes";
import clientRouter from "./routes/client.Routes";
import productRouter from "./routes/product.Routes";
import categoryRouter from "./routes/category.Routes";
import orderRouter from "./routes/order.Routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://inventory-celestina.vercel.app"],
    credentials: true,
  })
);
app.use("/auth", routerAuth)
app.use("/clients", clientRouter)
app.use("/products", productRouter)
app.use("/categories", categoryRouter)
app.use("/orders", orderRouter)
app.use(errorHandler)

app.listen(4000, () => console.log("Server running on port 4000"));


//npx tsx index.ts