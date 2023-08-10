import express from "express";
import fetchuser from "../../middleware/auth_by_token.js";
import {
  add_employee,
  add_users,
  admin_login,
  Admin_password_change,
  delete_user,
  forgot_password,
  get_all_admin,
  get_all_employee,
  get_all_user,
  get_dashboard_details,
  get_superAdmin_dashboard_details,
  reset_password,
  search_user,
  update_admin,
  update_employee,
  update_user,
  user_details,
  user_profile_update,
} from "../controllers/UsersController.js";

const usersRouter = express.Router();
usersRouter.post("/add_users", add_users);
usersRouter.post("/get_users", get_all_user);
usersRouter.post("/get_dashboard_details", get_dashboard_details);
usersRouter.get(
  "/get_superAdmin_dashboard_details",
  get_superAdmin_dashboard_details
);
usersRouter.post("/search_user", search_user);
usersRouter.post("/forget_password", forgot_password);
usersRouter.post("/reset_password", reset_password);
usersRouter.post("/admin_login", admin_login);
usersRouter.post("/getUserById", user_details);
usersRouter.put("/update_user", fetchuser, update_user);
usersRouter.put("/user_profile_update", user_profile_update);
usersRouter.put("/delete_user", delete_user);
usersRouter.put("/admin_password_change", Admin_password_change);
//  super admin router define here-------------------------------------------------
usersRouter.post("/get_all_admin", get_all_admin);
usersRouter.post("/get_all_employee", get_all_employee);
usersRouter.put("/update_admin", update_admin);
usersRouter.post("/add_employee", add_employee);
usersRouter.put("/update_employee", update_employee);
export default usersRouter;
