import express from "express";
import {
  add_user,
  delete_restore_user,
  getalluser,
  update_user,
  user_search,
  user_signup,
  user_otp_verify,
  user_login,
  user_details,
  change_user_password,
  user_forgate_password,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/add_user", add_user);
userRouter.get("/all_user", getalluser);
userRouter.get("/user_search", user_search);

userRouter.post("/user_signup", user_signup);
userRouter.post("/user_otp_verify", user_otp_verify);
userRouter.post("/user_login", user_login);
// userRouter.post("/user_profile_update", user_profile_update);
userRouter.put("/update_user", update_user);
userRouter.put("/delete_restore_user", delete_restore_user);
userRouter.post("/user_search", user_search);
userRouter.get("/user_details", user_details);
userRouter.post("/change_user_password", change_user_password);
userRouter.post("/user_forgate_password", user_forgate_password);

export default userRouter;
