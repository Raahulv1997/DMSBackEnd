import jwt from "jsonwebtoken";
import connection from "../Db.js";

const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET_KEY;
const fetchSuperAdmin = (req, res, next) => {
  if ("super_admin_token" in req.headers) {
    if (
      req.headers.super_admin_token != "" &&
      req.headers.super_admin_token != undefined
    ) {
      var token_super_admin = req.headers.super_admin_token;

      try {
        var super_admin_data = jwt.verify(
          token_super_admin,
          ADMIN_JWT_SECRET_KEY
        );
        var aid = super_admin_data.id;

        connection.query(
          "SELECT * FROM `super_admin` WHERE `id` = " + aid + "",
          async (err, rows) => {
            if (err) {
              res.status(200).send(err);
            } else {
              if (rows != "") {
                req.user = aid;

                next();
              } else {
                res.status(200).send("super_admin not matched");
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
      res.send({ response: "super admin token not in header" });
    }
  } else {
    res.send({ response: "header error" });
  }
};

export default fetchSuperAdmin;
