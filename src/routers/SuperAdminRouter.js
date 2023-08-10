import express from "express";
import { super_admin_login } from "../controllers/SuperAdminController.js";
const SuperAdminRouter = express.Router();

SuperAdminRouter.post("/super_admin_login", super_admin_login);

export default SuperAdminRouter;
