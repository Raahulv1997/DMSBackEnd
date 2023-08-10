import express from "express";
import fetchuser from "../../middleware/auth_by_token.js";
import {
  add_clients,
  delete_client,
  get_all_clients,
  get_client_by_Id,
  search_client,
  update_client,
} from "../controllers/ClientController.js";

const clientRouter = express.Router();
clientRouter.post("/add_clients", add_clients);
clientRouter.post("/get_client_by_Id", get_client_by_Id);
clientRouter.post("/get_clients", get_all_clients);
clientRouter.post("/search_clients", search_client);
clientRouter.put("/update_client", update_client);
clientRouter.put("/delete_client", delete_client);
export default clientRouter;
