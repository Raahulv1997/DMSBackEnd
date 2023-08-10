import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";

// export async function add_clients(req, res) {
//   var {
//     admin_id,
//     type,
//     name,
//     email,
//     phone_no,
//     address,
//     company_name,
//     company_address,
//   } = req.body;
//   connection.query(
//     "SELECT * FROM `clients` WHERE `admin_id`='" +
//       admin_id +
//       "' AND `email`='" +
//       email +
//       "'",
//     (err, rows) => {
//       if (err) {
//         // console.log(err);
//         // res
//         //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
//         //   .json({ message: "something went wrong" });
//       } else {
//         if (rows == "") {
//           connection.query(
//             "insert into clients ( `admin_id`,`type`, `name`, `email`,`phone_no`,`address`,`company_name`,`company_address`) VALUES('" +
//               admin_id +
//               "','" +
//               type +
//               "', '" +
//               name +
//               "', '" +
//               email +
//               "','" +
//               phone_no +
//               "', '" +
//               address +
//               "', '" +
//               company_name +
//               "', '" +
//               company_address +
//               "') ",
//             (err, rows) => {
//               if (err) {
//                 res
//                   .status(StatusCodes.INTERNAL_SERVER_ERROR)
//                   .json({ message: "something went wrong" });
//               } else {
//                 res
//                   .status(StatusCodes.OK)
//                   .json({ message: "Client added successfully" });
//               }
//             }
//           );
//         } else {
//           res
//             .status(StatusCodes.OK)
//             .json({ message: "already added by this admin" });
//         }
//         // res.status(StatusCodes.OK).json({ message: rows });
//       }
//     }
//   );
// }

export async function add_clients(req, res) {
  let generated_token = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 70) {
    generated_token += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    counter += 1;
  }

  var {
    admin_id,
    type,
    name,
    email,
    phone_no,
    address,
    company_name,
    company_address,
  } = req.body;
  connection.query(
    "SELECT * FROM `clients` WHERE `admin_id`='" +
      admin_id +
      "' AND `email`='" +
      email +
      "'",
    (err, rows) => {
      if (err) {
        // console.log(err);
        // res
        //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
        //   .json({ message: "something went wrong" });
      } else {
        if (rows == "") {
          connection.query(
            "insert into clients ( `admin_id`,`type`, `name`, `email`,`client_token`,`phone_no`,`address`,`company_name`,`company_address`) VALUES('" +
              admin_id +
              "','" +
              type +
              "', '" +
              name +
              "', '" +
              email +
              "','" +
              generated_token +
              "','" +
              phone_no +
              "', '" +
              address +
              "', '" +
              company_name +
              "', '" +
              company_address +
              "') ",
            (err, rows) => {
              if (err) {
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ message: err });
              } else {
                res
                  .status(StatusCodes.OK)
                  .json({ message: "Client added successfully" });
              }
            }
          );
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "already added by this admin" });
        }
        // res.status(StatusCodes.OK).json({ message: rows });
      }
    }
  );
}

export async function update_client(req, res) {
  var {
    id,
    admin_id,
    type,
    name,
    email,
    phone_no,
    address,
    company_name,
    company_address,
  } = req.body;

  let generated_token = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 70) {
    generated_token += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    counter += 1;
  }

  connection.query(
    "UPDATE `clients` SET `admin_id`='" +
      admin_id +
      "',`type`='" +
      type +
      "',`name`='" +
      name +
      "',`phone_no`='" +
      phone_no +
      "',`email`='" +
      email +
      "',`client_token`='" +
      generated_token +
      "',`address`='" +
      address +
      "',`company_name`='" +
      company_name +
      "',`company_address`='" +
      company_address +
      "' WHERE id='" +
      id +
      "' ",
    (err, rows) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err });
      } else {
        res
          .status(StatusCodes.OK)
          .json({ message: "updated Client successfully" });
      }
    }
  );
}
export async function get_all_clients(req, res) {
  let { admin_id } = req.body;
  connection.query(
    "select * from clients where admin_id='" +
      admin_id +
      "' AND is_deleted='0'",
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

export async function get_client_by_Id(req, res) {
  var { id } = req.body;
  connection.query(
    "select * from clients where id= '" + id + "'",
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

export async function delete_client(req, res) {
  var { id, is_deleted } = req.body;

  if (id != "" && is_deleted != "") {
    connection.query(
      "update clients  set `is_deleted`='" +
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
            .json({ message: "delete clients successfully" });
        }
      }
    );
  } else {
    res.status(StatusCodes.OK).json({ message: "fill all inputs" });
  }
}

// export async function search_client(req, res) {
//   var { name, type } = req.body;

//   if (name != "" || type != "") {
//     var newstr = "SELECT * clients WHERE ";

//     connection.query(
//       (newstr += 'name like"%' + name + '%"  or type="' + type + '"'),
//       (err, rows) => {
//         if (err) {
//           console.log(err);
//           res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ message: "something went wrong" });
//         } else {
//           res.status(StatusCodes.OK).json({ message: res });
//         }
//       }
//     );
//   } else {
//     res
//       .status(StatusCodes.OK)
//       .json({ message: "please fill name and type first" });
//   }
// }

export async function search_client(req, res) {
  const { admin_id } = req.query;
  const page = parseInt(req.query.page); // Current page number
  const limit = parseInt(req.query.limit); // Number of items per page
  const offset = (page - 1) * limit;
  // SELECT * FROM `documents`WHERE client_id = '1' AND is_deleted = 0 ORDER BY id DESC LIMIT 3 OFFSET 0
  var stringsearch =
    "SELECT * FROM `clients` WHERE admin_id='" + admin_id + "' AND ";

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
      "SELECT * FROM `clients` WHERE admin_id='" + admin_id + "' AND ";
  }

  connection.query(
    "" +
      stringsearch +
      " is_deleted = 0 ORDER BY id DESC LIMIT " +
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
          "SELECT COUNT(*) as total_count FROM clients  WHERE admin_id='" +
          admin_id +
          "'AND  is_deleted = 0 ORDER BY id DESC ";
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
