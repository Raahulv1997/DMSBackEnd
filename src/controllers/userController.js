import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function add_user(req, res) {
  var {
    first_name,
    last_name,
    email,
    password,
    phone_no,
    pincode,
    city,
    address,
    alternate_address,
  } = req.body;

  connection.query(
    "insert into user  ( `first_name`, `last_name`, `email`,`password`,`phone_no`,`pincode`,`city`,`address`,`alternate_address`) VALUES('" +
      first_name +
      "', '" +
      last_name +
      "', '" +
      email +
      "','" +
      password +
      "', '" +
      phone_no +
      "', '" +
      pincode +
      "', '" +
      city +
      "', '" +
      address +
      "','" +
      alternate_address +
      "') ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json({ message: "user added successfully" });
      }
    }
  );
}

export async function getalluser(req, res) {
  connection.query("select * from user", (err, rows) => {
    if (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "something went wrong" });
    } else {
      res.status(StatusCodes.OK).json(rows);
    }
  });
}

export async function user_details(req, res) {
  connection.query(
    "select * from user where id= '" + req.user_id + "'",
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
  var {
    first_name,
    last_name,
    phone_no,
    pincode,
    city,
    address,
    alternate_address,
  } = req.body;

  connection.query(
    "update user  set `first_name`= '" +
      first_name +
      "' , `last_name`='" +
      last_name +
      "', `phone_no` ='" +
      phone_no +
      "', `pincode` ='" +
      pincode +
      "', `city`='" +
      city +
      "', `address`='" +
      address +
      "', `alternate_address`='" +
      alternate_address +
      "' where id ='" +
      req.user_id +
      "'",
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

export async function delete_restore_user(req, res) {
  var { user_id, is_delete } = req.body;

  if (user_id != "" && is_delete != "") {
    connection.query(
      "update user  set `is_deleted`='" +
        is_delete +
        "' where id ='" +
        user_id +
        "'",
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
  } else {
    res.status(StatusCodes.OK).json({ message: "fill all inputs" });
  }
}

export async function user_search(req, res) {
  var { search } = req.body;
  if (search == "") {
    connection.query("select * from user where 1", (err, rows) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    });
  } else {
    if (search !== "") {
      var search_string = "";
      search_string +=
        ' `first_name` LIKE  "%' +
        search +
        '%" OR `email` LIKE "%' +
        search +
        '%" ';

      connection.query(
        "select * from user where" + search_string + "",
        (err, rows) => {
          if (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
          } else {
            res.status(StatusCodes.OK).json(rows);
          }
        }
      );
    }
  }
}

export function user_signup(req, res) {
  if (req.body.email != "" && req.body.password != "") {
    let u_email = req.body.email.trim();
    let u_password = req.body.password.trim();
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;

    if (regex.test(u_email)) {
      connection.query(
        "SELECT * FROM user WHERE email = '" + u_email + "'",
        (err, rows) => {
          if (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
          } else {
            if (rows != "") {
              res
                .status(200)
                .send({
                  response: "email already exists, please use logIn way",
                });
            } else {
              const OTP = Math.floor(100000 + Math.random() * 900000);

              connection.query(
                'INSERT INTO `user_auth_by_otp` (`email`, `otp`, `user_password`) VALUES ("' +
                  u_email +
                  '","' +
                  OTP +
                  '","' +
                  u_password +
                  '")',
                (err, rows, fields) => {
                  if (err) {
                    if (err.code == "ER_DUP_ENTRY") {
                      res
                        .status(200)
                        .send({
                          status: "200",
                          response:
                            "email already exist, check your mail or try after sometime",
                        });
                    } else {
                      res.status(200).send(err);
                    }
                  } else {
                    if (rows != "") {
                      const mail_configs = {
                        from: "ashish.we2code@gmail.com",
                        to: u_email,
                        subject: "Nursery_live one time password",
                        text: "use otp within 60 sec.",
                        html: "<h1>your one time password " + OTP + " <h1/>",
                      };
                      nodemailer
                        .createTransport({
                          service: "gmail",
                          auth: {
                            user: "ashish.we2code@gmail.com",
                            pass: "nczaguozpagczmjv",
                          },
                        })
                        .sendMail(mail_configs, (err) => {
                          if (err) {
                            res
                              .status(200)
                              .send({
                                response: "not send email service error",
                              });
                            return; //console.log({ "email_error": err });
                          } else {
                            res
                              .status(200)
                              .send({
                                response: "send otp on your mail",
                                otp: OTP,
                              });
                            return { send_mail_status: "send successfully" };
                          }
                        });
                      setTimeout(function () {
                        connection.query(
                          'DELETE FROM `user_auth_by_otp` WHERE `id` = "' +
                            rows.insertId +
                            '"',
                          (err, rows, fields) => {
                            if (err) {
                            } else {
                            }
                          }
                        );
                      }, 60000);
                    } else {
                      console.log("Not insert in otp in database");
                    }
                  }
                }
              );
            }
          }
        }
      );
    } else {
      res.status(200).send({ response: "email formate is not valid" });
    }
  } else {
    console.log("please fill mail brfore submit");
    res
      .status(200)
      .send({ response: " brfore submit, please fill mail address" });
  }
}

export function user_otp_verify(req, res) {
  console.log("user_login");
  let user_email = req.body.email.trim();
  let user_otp = req.body.otp.trim();
  if (req.body.email != "" && req.body.otp != "") {
    console.log(
      'SELECT * FROM `user_auth_by_otp` WHERE email = "' +
        user_email +
        '" AND otp = "' +
        user_otp +
        '"'
    );
    connection.query(
      'SELECT * FROM `user_auth_by_otp` WHERE email = "' +
        user_email +
        '" AND otp = "' +
        user_otp +
        '"',
      (err, rows, fields) => {
        if (err) {
          console.log("err____________________267");
          console.log(err);
          res.status(200).send({ response: "find error" });
        } else {
          console.log("_rows_________________271");
          console.log(rows);
          if (rows != "") {
            if (user_email == rows[0].email && user_otp == rows[0].otp) {
              connection.query(
                "insert into user  ( `email`,`password`) VALUES('" +
                  user_email +
                  "','" +
                  rows[0].user_password +
                  "') ",
                (err, rows) => {
                  if (err) {
                    console.log(err);

                    if (err.code == "ER_DUP_ENTRY") {
                      connection.query(
                        "SELECT * FROM user WHERE email = '" +
                          user_email +
                          "' ",
                        (err, rows) => {
                          if (err) {
                            res
                              .status(StatusCodes.INTERNAL_SERVER_ERROR)
                              .json({ message: "something went wrong" });
                          } else {
                            if (rows != "") {
                              res.status(200).json(rows);
                            } else {
                              res.status(200).json(rows);
                            }
                          }
                        }
                      );
                    } else {
                      res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ message: "something went wrong" });
                    }
                  } else {
                    let uid = rows.insertId;
                    jwt.sign(
                      { id: rows.insertId },
                      process.env.USER_JWT_SECRET_KEY,
                      function (err, token) {
                        //console.log(token);
                        if (err) {
                          //console.log(err)
                        }
                        connection.query(
                          'INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' +
                            rows.insertId +
                            '","user","welcome to nursery live please compleate your profile","unread"),("001","admin","create new user (user_id ' +
                            rows.insertId +
                            ')","unread")',
                          (err, rows) => {
                            if (err) {
                              //console.log({ "notification": err })
                            } else {
                              console.log(
                                "_______notification-send__94________"
                              );
                            }
                          }
                        );
                        res.send({
                          response: "successfully created",
                          user_id: rows.insertId,
                          token: token,
                          redirect_url: "http://localhost:3000/",
                        });
                      }
                    );

                    // res.status(StatusCodes.OK).json({ message: "user added successfully" });
                  }
                }
              );
            } else {
              console.log("not match ________-278");
            }
          } else {
            res.status(200).send({ response: "not matched, credential issue" });
          }
        }
      }
    );
  } else {
    res.status(200).send({ response: "please fill all inputs" });
  }
}

export function user_login(req, res) {
  console.log("user_login");
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  let user_email = req.body.email.trim();
  let password = req.body.password.trim();

  if (req.body.email != "" && req.body.password != "") {
    if (regex.test(user_email)) {
      console.log("true");
      connection.query(
        'SELECT * FROM user WHERE email ="' +
          user_email +
          '" AND password ="' +
          password +
          '"',
        (err, rows) => {
          if (err) {
            console.log(err);
            res.status(200).send({ response: "login error" });
          } else {
            console.log(rows);
            if (rows != "") {
              console.log("rows[0].user_id_______________324___");
              console.log(rows[0].id);
              console.log(process.env.USER_JWT_SECRET_KEY);

              jwt.sign(
                { id: rows[0].id },
                process.env.USER_JWT_SECRET_KEY,
                function (err, token) {
                  //console.log(token);
                  if (err) {
                    //console.log(err)
                  }
                  res.send({
                    response: "successfully login",
                    token: token,
                    redirect_url: "http://localhost:3000/",
                  });
                }
              );
            } else {
              res.status(200).send({ response: "creadintial not match" });
            }
          }
        }
      );
    } else {
      console.log("mail formate errror");
    }
  } else {
    console.log("please fill all inputs");
  }
}

export function change_user_password(req, res) {
  console.log("change_user_password");
  var { old_password, new_password, email } = req.body;
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  if (regex.test(email.trim())) {
    if (old_password != "" && new_password != "" && email != "") {
      connection.query(
        "update user  set `password`='" +
          new_password.trim() +
          "' where email ='" +
          email.trim() +
          "' AND password = '" +
          old_password.trim() +
          "'",
        (err, rows) => {
          if (err) {
            console.log(err);
            res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: "something went wrong" });
          } else {
            if (rows.affectedRows == "1") {
              res
                .status(StatusCodes.OK)
                .json({ message: "updated user successfully" });
            } else {
              res
                .status(StatusCodes.OK)
                .json({ message: "password not update, credential issue" });
            }
          }
        }
      );
    } else {
      res.status(StatusCodes.OK).json({ message: "fill all inputs" });
    }
  } else {
    res.status(StatusCodes.OK).json({ message: "email formate not valid" });
  }
}

export function user_forgate_password(req, res) {
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  if (regex.test(req.body.email.trim()) && req.body.email != "") {
    const OTP = Math.floor(100000 + Math.random() * 900000);
    connection.query(
      'INSERT INTO `user_auth_by_otp` (`email`, `otp`) VALUES ("' +
        req.body.email +
        '","' +
        OTP +
        '")',
      (err, rows, fields) => {
        if (err) {
          if (err.code == "ER_DUP_ENTRY") {
            res
              .status(200)
              .send({
                status: "200",
                response:
                  "email already exist, check your mail or try after sometime",
              });
          } else {
            res.status(200).send(err);
          }
        } else {
          if (rows != "") {
            const mail_configs = {
              from: "ashish.we2code@gmail.com",
              to: req.body.email,
              subject: "Nursery_live one time password",
              text: "use otp within 60 sec.",
              html: "<h1>your one time password " + OTP + " <h1/>",
            };
            nodemailer
              .createTransport({
                service: "gmail",
                auth: {
                  user: "ashish.we2code@gmail.com",
                  pass: "nczaguozpagczmjv",
                },
              })
              .sendMail(mail_configs, (err) => {
                if (err) {
                  res
                    .status(200)
                    .send({ response: "not send email service error" });
                  return; //console.log({ "email_error": err });
                } else {
                  res
                    .status(200)
                    .send({ response: "send otp on your mail", otp: OTP });
                  return { send_mail_status: "send successfully" };
                }
              });
            setTimeout(function () {
              connection.query(
                'DELETE FROM `user_auth_by_otp` WHERE `id` = "' +
                  rows.insertId +
                  '"',
                (err, rows, fields) => {
                  if (err) {
                    console.log("err____________________232");
                    console.log(err);
                  } else {
                    console.log("delete__________________234");
                    console.log(rows);
                  }
                }
              );
            }, 60000);
          } else {
            console.log("Not insert in otp in database");
          }
        }
      }
    );
  } else {
    res.status(200).send({ response: "cheack eamil foramate" });
  }
}
