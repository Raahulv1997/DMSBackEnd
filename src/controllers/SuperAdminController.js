import connection from "../../Db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET_KEY;
export async function super_admin_login(req, res) {
  var { email, password } = req.body;

  if (email && password) {
    connection.query(
      'SELECT `id`,`name`, `email` , `password` FROM `super_admin`  WHERE `email` ="' +
        email +
        '"',
      async (err, results) => {
        if (err) {
          //console.log(err)
          res.send(err);
        } else {
          if (results != "") {
            //__________bcrypt_____________________________________

            var db_psw = JSON.parse(JSON.stringify(results[0].password));
            // //console.log(typeof psw)
            const validPassword = await bcrypt.compare(password, db_psw);

            if (validPassword) {
              jwt.sign(
                { id: results[0].id },
                ADMIN_JWT_SECRET_KEY,
                function (err, token) {
                  //console.log(token);
                  if (err) {
                  }
                  res.send({
                    resCode: "101",
                    SuperAdmin_Details: results,
                    status: true,
                    SuperAdmin_token: token,
                  });
                }
              );
            } else {
              res.send({ resCode: "102", message: "password not matched" });
            }
          } else {
            res.send({ resCode: "103", message: "Email not found" });
          }
        }
      }
    );
  } else {
    res.send({ resCode: "104", message: "please fill input" });
  }
}
