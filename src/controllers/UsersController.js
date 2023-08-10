import { StatusCodes } from "http-status-codes";
import connection from "../../Db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET_KEY;

// var rendomNumber = Math.floor(100000 + Math.random() * 900000);

export async function add_users(req, res) {
  var { admin_id, type, name, phone_no, is_active, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const password_salt = await bcrypt.hash(password, salt);

  connection.query(
    "insert into users(`admin_id`,`type`,`name`,`phone_no`,`is_active`,`email`,`password`) VALUES('" +
      admin_id +
      "','" +
      type +
      "','" +
      name +
      "','" +
      phone_no +
      "','" +
      is_active +
      "','" +
      email +
      "','" +
      password_salt +
      "')",
    (err, rows) => {
      if (err) {
        // res
        //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
        //   .json({ message: "something went wrong" });

        if (err.code == "ER_DUP_ENTRY") {
          res.status(200).send({
            response:
              "email already exist, check your mail or try after sometime",
            success: false,
          });
        } else {
          res.status(200).send({ response: "error", success: false });
        }
      } else {
        if (type == "admin") {
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "rahul.verma.we2code@gmail.com",
              pass: "sfbmekwihdamgxia",
            },
          });

          let mailDetails = {
            from: "rahul.verma.we2code@gmail.com",
            to: `${email}`,
            subject: "Wellcome message for admin",
            html: `<h4>Welcome, ${name}! </h4>
            <p>Welcome on board, Admin! 🌟 We're excited to have you join our team. Your expertise and leadership will undoubtedly make a significant impact. Let's achieve great things together!</p>`,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              res.status(200).send({ message: "email not send" });
            } else {
              res.status(StatusCodes.OK).json({
                IsmailSend: "email send successfully",
                message: "user added successfully",
              });
            }
          });
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "user added successfully" });
        }
      }
    }
  );
}

export async function get_all_user(req, res) {
  let { admin_id } = req.body;
  connection.query(
    "select * from users where admin_id='" + admin_id + "' AND is_deleted='0' ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function admin_login(req, res) {
  var { email, password } = req.body;

  // const salt = await bcrypt.genSalt(10);
  // password_salt = await bcrypt.hash(admin_password, salt);
  // //console.log(password_salt)

  // const validPassword = await bcrypt.compare(admin_password,'$2b$10$81UsHRVghsW.47o7dMqiQ.DsJgTfz333wDFKTYZYQOGkJhoSEr1m6');
  // //console.log(validPassword)
  if (email && password) {
    connection.query(
      'SELECT `id`,`admin_id`,`type`,`name`, `email` , `password` FROM `users`  WHERE `email` ="' +
        email +
        '" AND is_active="1" AND is_deleted="0" ',
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
                    userDetail: results,
                    status: true,
                    token: token,
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

export async function user_details(req, res) {
  var { id } = req.body;
  connection.query(
    "select * from users where id= '" + id + "'",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function update_user(req, res) {
  var { id, type, name, phone_no, is_active, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const password_salt = await bcrypt.hash(password, salt);

  connection.query(
    "UPDATE `users` SET `admin_id`='" +
      req.user +
      "',`type`='" +
      type +
      "',`name`='" +
      name +
      "',`phone_no`='" +
      phone_no +
      "',`email`='" +
      email +
      "',`password`='" +
      password_salt +
      "',`is_active`='" +
      is_active +
      "' WHERE id='" +
      id +
      "' ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res
          .status(StatusCodes.OK)
          .json({ message: "updated user successfully" });
      }
    }
  );
}

export async function delete_user(req, res) {
  var { id, is_deleted } = req.body;

  if (id != "" && is_deleted != "") {
    connection.query(
      "update users  set `is_deleted`='" +
        is_deleted +
        "' where id ='" +
        id +
        "'",
      (err, rows) => {
        if (err) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "something went wrong" });
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "delete user successfully" });
        }
      }
    );
  } else {
    res.status(StatusCodes.OK).json({ message: "fill all inputs" });
  }
}

export async function search_user(req, res) {
  const { admin_id } = req.query;

  const page = parseInt(req.query.page); // Current page number
  const limit = parseInt(req.query.limit); // Number of items per page
  const offset = (page - 1) * limit;
  var stringsearch =
    "SELECT * FROM `users` WHERE admin_id='" + admin_id + "' AND ";

  var all_blank = true;
  var catobj = req.body;
  var objvalue = Object.values(catobj);
  var objkey = Object.keys(catobj);

  for (let m = 0; m < objkey.length; m++) {
    if (objvalue[m] != "") {
      stringsearch +=
        " `" +
        objkey[m] +
        "` LIKE '%" +
        objvalue[m].replace(/[^a-zA-Z0-9 ]/g, "").trim() +
        "%' AND";
      all_blank = false;
    } else {
    }
  }

  if (all_blank) {
    stringsearch =
      "SELECT * FROM `users` WHERE admin_id='" + admin_id + "' AND ";
  }

  connection.query(
    "" +
      stringsearch +
      " is_deleted = 0 ORDER BY id DESC  LIMIT " +
      limit +
      " OFFSET " +
      offset +
      "",
    (err, rows, fields) => {
      if (err) {
        //console.log("/category_error" + err)
        res.status(502).send(err);
      } else {
        const countQuery =
          "SELECT COUNT(*) as total_count FROM users  WHERE admin_id='" +
          admin_id +
          "'AND  is_deleted = 0 ORDER BY id DESC  ";
        connection.query(countQuery, (err, countResult) => {
          if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }
          const totalRecords = countResult[0].total_count;
          const totalPages = Math.ceil(totalRecords / limit);
          const nextPage = page < totalPages ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;
          res.json({
            data: rows,
            page,
            totalPages,
            totalRecords,
            nextPage,
            prevPage,
          });
        });
      }
    }
  );
}

export function forgot_password(req, res) {
  // req.protocol +
  // "://" +
  // req.headers.host +
  // console.log("path----" + req.headers.host);
  var host = req.headers.host;
  var newOne = host.replace(":8888", ":3006");

  var { email } = req.body;
  if (email) {
    connection.query(
      'SELECT  `id` , `email` FROM `users`  WHERE `email` ="' + email + '"',
      async (err, results) => {
        if (err) {
          res.send(err);
        } else {
          if (results != "") {
            var edata = results[0].email;

            jwt.sign(
              { id: results[0].id },
              ADMIN_JWT_SECRET_KEY,
              function (err, token) {
                if (err) {
                } else {
                  connection.query(
                    "UPDATE `users` SET `email_token`='" +
                      token +
                      "' WHERE id='" +
                      results[0].id +
                      "' ",
                    (err, rows) => {
                      if (err) {
                        res
                          .status(StatusCodes.INTERNAL_SERVER_ERROR)
                          .json({ message: "something went wrong" });
                      }
                      let mailTransporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: "rahul.verma.we2code@gmail.com",
                          pass: "sfbmekwihdamgxia",
                        },
                      });

                      let mailDetails = {
                        from: "rahul.verma.we2code@gmail.com",
                        to: `${edata}`,
                        subject: "Reset Password Link",
                        html: `<a href="http://${newOne}/resetpassword?token=${token}"> Reset password Link</a>`,
                      };
                      mailTransporter.sendMail(
                        mailDetails,
                        function (err, data) {
                          if (err) {
                            res.status(200).send({ message: "email not send" });
                          } else {
                            res
                              .status(StatusCodes.OK)
                              .json({ message: "email send successfully" });
                          }
                        }
                      );
                    }
                  );
                }
              }
            );
          } else {
            res.send({ resCode: "103", message: "invalid_mail" });
          }
        }
      }
    );
  } else {
    res.send({ resCode: "104", message: "please fill input" });
  }
}

export async function reset_password(req, res) {
  var { password } = req.body;
  if ("email_token" in req.headers) {
    if (req.headers.email_token != "" && req.headers.email_token != undefined) {
      var email_token = req.headers.email_token;

      try {
        if (password != "") {
          var admin_data = jwt.verify(email_token, ADMIN_JWT_SECRET_KEY);
          var aid = admin_data.id;
          const salt = await bcrypt.genSalt(10);
          const password_salt = await bcrypt.hash(password, salt);

          connection.query(
            "UPDATE `users` SET `password`='" +
              password_salt +
              "'WHERE id='" +
              aid +
              "' ",
            (err, rows) => {
              if (err) {
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ message: "something went wrong" });
              } else {
                res
                  .status(StatusCodes.OK)
                  .json({ message: "updated password successfully" });
              }
            }
          );
        } else {
          res.send({ response: "please fill password" });
        }
      } catch (error) {
        res
          .status(401)
          .send({ error: "Please authenticate using a valid token" });
      }
    } else {
      res.send({ response: "Email token not in header" });
    }
  } else {
    res.send({ response: "header error" });
  }
}

// SELECT
//   (SELECT COUNT(*) FROM users WHERE admin_id = 1 AND is_deleted=0 ) AS employee,
//   (SELECT COUNT(*) FROM documents WHERE admin_id = 1 AND is_deleted=0 ) AS document,
//   (SELECT COUNT(*) FROM clients WHERE admin_id = 1 AND is_deleted=0 ) AS clients

export function get_dashboard_details(req, res) {
  let { admin_id } = req.body;

  connection.query(
    "SELECT " +
      "(SELECT COUNT(*) FROM users WHERE admin_id = '" +
      admin_id +
      "' AND is_deleted = 0) AS employee, " +
      "(SELECT COUNT(*) FROM documents WHERE admin_id = '" +
      admin_id +
      "' AND is_deleted = 0) AS document, " +
      "(SELECT COUNT(*) FROM clients WHERE admin_id ='" +
      admin_id +
      "'AND is_deleted = 0) AS clients",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export function user_profile_update(req, res) {
  var { id, name, phone_no, email, profile_picture, profile_picture_type } =
    req.body;

  if (profile_picture == "") {
    connection.query(
      "UPDATE `users` SET `name` = ?, `phone_no` = ?, `email` = ? WHERE id = ?",
      [name, phone_no, email, id],
      (err, rows) => {
        if (err) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Something went wrong" });
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "Updated user profile successfully" });
        }
      }
    );
  } else {
    const folderName = path.join(__dirname, "../../") + `public/user_profile/`;

    try {
      var name_str = "" + name + "";

      fs.writeFileSync(
        folderName + name_str + "." + profile_picture_type + "",
        profile_picture,
        "base64"
      );
    } catch (err) {}

    connection.query(
      "UPDATE `users` SET `name` = ?, `phone_no` = ?, `email` = ?, `profile_picture` = ? WHERE id = ?",
      [
        name,
        phone_no,
        email,
        req.protocol +
          "://" +
          req.headers.host +
          "/user_profile/" +
          name_str +
          "." +
          profile_picture_type,
        id,
      ],
      (err, rows) => {
        if (err) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Something went wrong" });
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "Updated user profile successfully" });
        }
      }
    );
  }
}

//super admin:-   Employeee , admin api controller here -----------------------------------------------
export async function get_all_admin(req, res) {
  // const { admin_id } = req.query;

  const page = parseInt(req.query.page); // Current page number
  const limit = parseInt(req.query.limit); // Number of items per page
  const offset = (page - 1) * limit;
  var stringsearch = "SELECT * FROM `users` WHERE type='admin' AND ";

  var all_blank = true;
  var catobj = req.body;
  var objvalue = Object.values(catobj);
  var objkey = Object.keys(catobj);

  for (let m = 0; m < objkey.length; m++) {
    if (objvalue[m] != "") {
      stringsearch +=
        " `" +
        objkey[m] +
        "` LIKE '%" +
        objvalue[m].replace(/[^a-zA-Z0-9 ]/g, "").trim() +
        "%' AND";
      all_blank = false;
    } else {
    }
  }

  if (all_blank) {
    stringsearch = "SELECT * FROM `users`  WHERE type='admin' AND ";
  }

  connection.query(
    "" +
      stringsearch +
      " is_deleted = 0 ORDER BY id DESC  LIMIT " +
      limit +
      " OFFSET " +
      offset +
      "",
    (err, rows, fields) => {
      if (err) {
        //console.log("/category_error" + err)
        res.status(502).send(err);
      } else {
        const countQuery =
          "SELECT COUNT(*) as total_count FROM users WHERE type='admin' AND  is_deleted = 0 ORDER BY id DESC  ";
        connection.query(countQuery, (err, countResult) => {
          if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }
          const totalRecords = countResult[0].total_count;
          const totalPages = Math.ceil(totalRecords / limit);
          const nextPage = page < totalPages ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;
          res.json({
            data: rows,
            page,
            totalPages,
            totalRecords,
            nextPage,
            prevPage,
          });
        });
      }
    }
  );
}

export async function get_all_employee(req, res) {
  const { admin_id } = req.query;

  const page = parseInt(req.query.page); // Current page number
  const limit = parseInt(req.query.limit); // Number of items per page
  const offset = (page - 1) * limit;
  var stringsearch =
    "SELECT * FROM `users` WHERE admin_id='" +
    admin_id +
    "' AND type='employee' AND ";

  var all_blank = true;
  var catobj = req.body;
  var objvalue = Object.values(catobj);
  var objkey = Object.keys(catobj);

  for (let m = 0; m < objkey.length; m++) {
    if (objvalue[m] != "") {
      stringsearch +=
        " `" +
        objkey[m] +
        "` LIKE '%" +
        objvalue[m].replace(/[^a-zA-Z0-9 ]/g, "").trim() +
        "%' AND";
      all_blank = false;
    } else {
    }
  }

  if (all_blank) {
    stringsearch =
      "SELECT * FROM `users`  WHERE admin_id='" +
      admin_id +
      "' AND type='employee' AND ";
  }

  connection.query(
    "" +
      stringsearch +
      " is_deleted = 0 ORDER BY id DESC  LIMIT " +
      limit +
      " OFFSET " +
      offset +
      "",
    (err, rows, fields) => {
      if (err) {
        //console.log("/category_error" + err)
        res.status(502).send(err);
      } else {
        const countQuery =
          "SELECT COUNT(*) as total_count FROM users WHERE admin_id='" +
          admin_id +
          "' AND type='employee' AND  is_deleted = 0 ORDER BY id DESC  ";
        connection.query(countQuery, (err, countResult) => {
          if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }
          const totalRecords = countResult[0].total_count;
          const totalPages = Math.ceil(totalRecords / limit);
          const nextPage = page < totalPages ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;
          res.json({
            data: rows,
            page,
            totalPages,
            totalRecords,
            nextPage,
            prevPage,
          });
        });
      }
    }
  );
}

export function get_superAdmin_dashboard_details(req, res) {
  // let { admin_id } = req.body;

  connection.query(
    "SELECT " +
      "(SELECT COUNT(*) FROM users WHERE type = 'admin' AND is_deleted = 0) AS admin," +
      "(SELECT COUNT(*) FROM users WHERE type = 'employee' AND is_deleted = 0) AS employee," +
      "(SELECT COUNT(*) FROM documents WHERE  is_deleted = 0) AS document, " +
      "(SELECT COUNT(*) FROM clients WHERE  is_deleted = 0) AS clients",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function update_admin(req, res) {
  var { id, type, name, phone_no, is_active, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const password_salt = await bcrypt.hash(password, salt);

  connection.query(
    "UPDATE `users` SET `admin_id`='0',`type`='" +
      type +
      "',`name`='" +
      name +
      "',`phone_no`='" +
      phone_no +
      "',`email`='" +
      email +
      "',`password`='" +
      password_salt +
      "',`is_active`='" +
      is_active +
      "' WHERE id='" +
      id +
      "' ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res
          .status(StatusCodes.OK)
          .json({ message: "updated user successfully" });
      }
    }
  );
}

export async function add_employee(req, res) {
  const { admin_id } = req.query;
  var { type, name, phone_no, is_active, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const password_salt = await bcrypt.hash(password, salt);

  connection.query(
    "insert into users(`admin_id`,`type`,`name`,`phone_no`,`is_active`,`email`,`password`) VALUES('" +
      admin_id +
      "','" +
      type +
      "','" +
      name +
      "','" +
      phone_no +
      "','" +
      is_active +
      "','" +
      email +
      "','" +
      password_salt +
      "')",
    (err, rows) => {
      if (err) {
        // res
        //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
        //   .json({ message: "something went wrong" });

        if (err.code == "ER_DUP_ENTRY") {
          res.status(200).send({
            response:
              "email already exist, check your mail or try after sometime",
            success: false,
          });
        } else {
          res.status(200).send({ response: "error", success: false });
        }
      } else {
        res.status(StatusCodes.OK).json({ message: "user added successfully" });
      }
    }
  );
}

export async function update_employee(req, res) {
  const { admin_id } = req.query;
  var { id, type, name, phone_no, is_active, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const password_salt = await bcrypt.hash(password, salt);

  connection.query(
    "UPDATE `users` SET `admin_id`='" +
      admin_id +
      "',`type`='" +
      type +
      "',`name`='" +
      name +
      "',`phone_no`='" +
      phone_no +
      "',`email`='" +
      email +
      "',`password`='" +
      password_salt +
      "',`is_active`='" +
      is_active +
      "' WHERE id='" +
      id +
      "' ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res
          .status(StatusCodes.OK)
          .json({ message: "updated user successfully" });
      }
    }
  );
}

export async function Admin_password_change(req, res) {
  var { id, oldPassword, NewPassword } = req.body;

  if (oldPassword && NewPassword) {
    connection.query(
      'SELECT `id`,`admin_id`, `password` FROM `users`  WHERE `id` ="' +
        id +
        '"  ',
      async (err, results) => {
        if (err) {
          //console.log(err)
          res.send(err);
        } else {
          if (results != "") {
            //__________bcrypt_____________________________________

            var db_psw = JSON.parse(JSON.stringify(results[0].password));
            // //console.log(typeof psw)
            const validPassword = await bcrypt.compare(oldPassword, db_psw);

            if (validPassword) {
              if (oldPassword == NewPassword) {
                res.send({
                  resCode: "102",
                  message: "Old and new password is same",
                });
              } else {
                const salt = await bcrypt.genSalt(10);
                const password_salt = await bcrypt.hash(NewPassword, salt);
                connection.query(
                  "UPDATE `users` SET `password`='" +
                    password_salt +
                    "'WHERE id='" +
                    id +
                    "' ",
                  (err, rows) => {
                    if (err) {
                      res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ message: "something went wrong" });
                    } else {
                      res
                        .status(StatusCodes.OK)
                        .json({ message: "updated password successfully" });
                    }
                  }
                );
              }
            } else {
              res.send({ resCode: "102", message: "incorrect old password" });
            }
          } else {
            res.send({ resCode: "103", message: "Something went wrong" });
          }
        }
      }
    );
  } else {
    res.send({ resCode: "104", message: "please fill input" });
  }
}
