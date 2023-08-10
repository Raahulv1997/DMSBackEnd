import connection from "./Db.js";
import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";

import clientRouter from "./src/routers/clientRouter.js";
import usersRouter from "./src/routers/usersRouter.js";
import documentRouter from "./src/routers/documentRouter.js";
import SuperAdminRouter from "./src/routers/SuperAdminRouter.js";

const app = express();
connection;
app.use(cors());

app.use(express.json({ limit: "90mb" }));
app.use(bodyParser.json());
// to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use(express.static("public"));

app.use(clientRouter);
app.use(usersRouter);
app.use(documentRouter);
app.use(SuperAdminRouter);
app.listen(8888, () => {
  console.log(`server is running at ${process.env.SERVERPORT}`);
});
