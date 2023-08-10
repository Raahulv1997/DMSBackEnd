import jwt from "jsonwebtoken";
import connection from "../Db.js";

const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET_KEY;
const fetchuser = (req, res, next) => {
  if ("admin_token" in req.headers) {
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
      var token_admin = req.headers.admin_token;

      try {
        var admin_data = jwt.verify(token_admin, ADMIN_JWT_SECRET_KEY);
        var aid = admin_data.id;

        connection.query(
          "SELECT * FROM `users` WHERE `id` = " + aid + "",
          async (err, rows) => {
            if (err) {
              res.status(200).send(err);
            } else {
              if (rows != "") {
                req.user = aid;

                next();
              } else {
                res.status(200).send("admin not matched");
              }
            }
          }
        );
      } catch (error) {
        res
          .status(401)
          .send({ error: "Please authenticate using a valid token" });
      }
    } else {
      res.send({ response: "admin token not in header" });
    }
  } else {
    res.send({ response: "header error" });
  }
};

export default fetchuser;
