import { Router } from "express";
import { loginAuth, logoutAuth, registerAuth, verifyAuth } from "../controllers/auth.Controller";
import { validateSchema } from "../middlewares/validateSchema.Middleware";
import { loginSchema, registerSchema } from "../schemas/auth.Schema";

const routerAuth = Router();

routerAuth.post("/register", validateSchema(registerSchema), registerAuth);
routerAuth.post("/login", validateSchema(loginSchema), loginAuth);
routerAuth.get("/verify", verifyAuth);
routerAuth.post("/logout", logoutAuth);

export default routerAuth;
