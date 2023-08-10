import fs from "fs";
import path from "path";
import connection from "../../Db.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { StatusCodes } from "http-status-codes";

import nodemailer from "nodemailer";

export function client_documents_upload(req, res) {
  var {
    admin_id,
    client_id,
    client_name,
    document_title,
    document_url,
    document_type,
  } = req.body;

  const folderName =
    path.join(__dirname, "../../") +
    `public/document_upload/${client_id}-${client_name}/`;

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {}

  if (document_type === "msword") {
    document_type = "doc";
  } else if (
    document_type ===
    "vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    document_type = "docx";
  } else if (document_type === "vnd.ms-excel") {
    document_type = "xls";
  } else if (
    document_type === "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    document_type = "xlsx";
  }

  try {
    var rendomNumber = Math.floor(100000 + Math.random() * 900000);
    var name_str = "" + document_title + "" + rendomNumber + "";

    fs.writeFileSync(
      folderName + name_str + "." + document_type + "",
      document_url,
      "base64"
    );
  } catch (err) {}
  // req.protocol + "://" + req.headers.host + "/user_profile/" + req.file.filename;
  connection.query(
    "INSERT INTO `documents`( `admin_id`, `client_id`,`document_type`, `document_title`, `document_url`) VALUES (" +
      admin_id +
      ',"' +
      client_id +
      '","' +
      document_type +
      '","' +
      document_title +
      '","' +
      req.protocol +
      "://" +
      req.headers.host +
      "/document_upload/" +
      client_id +
      "-" +
      client_name +
      "/" +
      name_str +
      "." +
      document_type +
      '")',
    (err, rows, fields) => {
      if (err) {
        //console.log(err)
        res.status(200).send(err);
      } else {
        res.status(200).send({ message: "Document upload successfully" });
      }
    }
  );
}

export function get_documents(req, res) {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of items per page
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM documents LIMIT ${limit} OFFSET ${offset}`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const countQuery = "SELECT COUNT(*) as total_count FROM documents";
    connection.query(countQuery, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const totalRecords = countResult[0].total_count;
      const totalPages = Math.ceil(totalRecords / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;
      res.json({
        data: results,
        page,
        totalPages,
        totalRecords,
        nextPage,
        prevPage,
      });
    });
  });
}

export function get_documents_By_Id(req, res) {
  var { id } = req.body;

  connection.query(
    "SELECT * FROM documents WHERE `id`=" + id + " ",
    (err, rows, fields) => {
      if (err) {
        //console.log(err)
        res.status(200).send(err);
      } else {
        //console.log("rows")
        res.status(200).send(rows);
      }
    }
  );
}

// export function client_documents_update(req, res) {
//   var rendomNumber = Math.floor(100000 + Math.random() * 900000);
//   var {
//     admin_id,
//     client_id,
//     client_name,
//     document_title,
//     document_url,
//     document_type,
//   } = req.body;

//   const folderName =
//     path.join(__dirname, "../../") +
//     `public/document_upload/${client_id}-${client_name}/`;

//   try {
//     if (!fs.existsSync(folderName)) {
//       fs.mkdirSync(folderName);
//     }
//   } catch (err) {
//     console.error(err);
//   }

//   try {
//     console.log(folderName);

//     var name_str = "" + document_title + "" + rendomNumber + "";

//     fs.writeFileSync(
//       folderName + name_str + "." + document_type + "",
//       document_url,
//       "base64"
//     );
//   } catch (err) {
//     console.log(err);
//   }

//   connection.query(
//     "INSERT INTO `documents`( `admin_id`, `client_id`,`document_type`, `document_title`, `document_url`) VALUES (" +
//       admin_id +
//       ',"' +
//       client_id +
//       '","' +
//       document_type +
//       '","' +
//       document_title +
//       '","http://localhost:8888/document_upload/' +
//       client_id +
//       "-" +
//       client_name +
//       "/" +
//       name_str +
//       "." +
//       document_type +
//       '")',
//     (err, rows, fields) => {
//       if (err) {
//         //console.log(err)
//         res.status(200).send(err);
//       } else {
//         res.status(200).send({ message: "Document upload successfully" });
//       }
//     }
//   );
// }

export async function delete_document(req, res) {
  var { id, is_deleted } = req.body;

  if (id != "" && is_deleted != "") {
    connection.query(
      "update documents  set `is_deleted`='" +
        is_deleted +
        "' where id ='" +
        id +
        "'",
      (err, rows) => {
        if (err) {
          console.log(err);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "something went wrong" });
        } else {
          res
            .status(StatusCodes.OK)
            .json({ message: "delete document successfully" });
        }
      }
    );
  } else {
    res.status(StatusCodes.OK).json({ message: "fill all inputs" });
  }
}

// export async function testingmailer(req, res) {
//   var { email } = req.body;

//   if (email != "") {
//     connection.query(
//       "SELECT * FROM clients WHERE `email`='" + email + " '  ",
//       (err, rows, fields) => {
//         if (err) {
//           console.log(err);
//         } else {
//           if (rows != "") {
//             var mailResponse = JSON.parse(JSON.stringify(rows));

//             var clientName = mailResponse[0].name;

//             let result =
//               "" +
//               req.protocol +
//               "://" +
//               req.headers.host +
//               "/document_upload_zipfiles/";

//             //           // console.log(result);
//             // return false;
//             let mailTransporter = nodemailer.createTransport({
//               service: "gmail",
//               auth: {
//                 user: "rahul.verma.we2code@gmail.com",
//                 pass: "sfbmekwihdamgxia",
//               },
//             });
//             let mailDetails = {
//               from: "rahul.verma.we2code@gmail.com",
//               to: `${email}`,
//               subject: "Test mail",
//               text: "Node.js testing mail",
//               attachments: [
//                 {
//                   filename: `${clientName}.zip`,
//                   path: `${result}/${clientName}.zip`,
//                 },
//               ],
//             };
//             mailTransporter.sendMail(mailDetails, function (err, data) {
//               if (err) {
//                 res.status(200).send({ message: "email not send" });
//               } else {
//                 res
//                   .status(StatusCodes.OK)
//                   .json({ message: "email send successfully" });
//               }
//             });
//           } else {
//             res.status(200).send({ message: "somthing went wrong" });
//           }
//         }
//       }
//     );
//   } else {
//     res.status(200).send({ message: "please fill Email" });
//   }
// }

export async function testingmailer(req, res) {
  var { email, client_name } = req.body;

  if (email != "") {
    let result =
      "" +
      req.protocol +
      "://" +
      req.headers.host +
      "/document_upload_zipfiles/";

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
      subject: "Documents",
      html: `<p>Hello,</p> <p>Here is the documents of ${client_name}</p> <p>Please find the attachments</p>`,
      attachments: [
        {
          filename: `${client_name}.zip`,
          path: `${result}/${client_name}.zip`,
        },
      ],
    };
    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        res.status(200).send({ message: "email not send" });
      } else {
        res.status(StatusCodes.OK).json({ message: "email send successfully" });
      }
    });
  } else {
    res.status(200).send({ message: "please fill Email" });
  }
}

// create zip
//           const folderName =
//             path.join(__dirname, "../../") +
//             `public/document_upload/${clientID}-${clientName}/`;
//           const createzipFolder =
//             path.join(__dirname, "../../") +
//             `public/document_upload_zipfiles/${clientID}-${clientName}-allZip/`;
//           try {
//             if (fs.existsSync(folderName)) {
//               fs.mkdirSync(createzipFolder);
//             }
//           } catch (err) {
//             if (fs.existsSync(createzipFolder)) {
//               console.log("zip  folder is already exist");
//             }
//           }
//           // function createZipFile(folderName, createzipFolder) {
//           //   const output = fs.createWriteStream(createzipFolder);
//           //   const archive = archiver("zip", { zlib: { level: 9 } });
//           //   return new Promise((resolve, reject) => {
//           //     output.on("close", () => {
//           //       console.log("Zip file created successfully.");
//           //       resolve();
//           //     });
//           //     archive.on("error", (err) => {
//           //       console.error("Error creating zip file:", err);
//           //       reject(err);
//           //     });
//           //     archive.pipe(output);
//           //     archive.directory(folderName, false);
//           //     archive.finalize();
//           //   });
//           // }
//           // createZipFile(folderName, `${createzipFolder}/${clientName}.zip`)
//           //   .then(() => {
//           //     console.log("Zip file creation completed.");
//           //   })
//           //   .catch((error) => {
//           //     console.error("Error creating zip file:", error);
//           //   });
//           connection.query(
//             "SELECT * FROM  documents WHERE `client_id`='" +
//               clientID +
//               " '  ",
//             (err, rows, fields) => {
//               if (err) {
//               } else {
//                 // Create a writable stream to store the data
//                 const outputStream = fs.createWriteStream("data.zip");
//                 // Create an archiver instance
//                 const archive = archiver("zip", {
//                   zlib: { level: 9 }, // Compression level (optional)
//                 });
//                 // Pipe the output stream to the archive
//                 archive.pipe(outputStream);
//                 // Iterate over the fetched data and add it to the archive
//                 rows.forEach((row, index) => {
//                   // Add each row to the archive as a file
//                   archive.append(JSON.stringify(row), {
//                     name: `data${index}.json`,
//                   });
//                 });
//                 // Finalize the archive
//                 archive.finalize();
//                 console.log(rows);
//               }
//             }
//           );

export async function search_document(req, res) {
  const { client_id } = req.query;
  const page = parseInt(req.query.page); // Current page number
  const limit = parseInt(req.query.limit); // Number of items per page
  const offset = (page - 1) * limit;

  // SELECT * FROM `documents`WHERE client_id = '1' AND is_deleted = 0 ORDER BY id DESC LIMIT 3 OFFSET 0
  var pagination_query;
  if (limit == 0 && offset == 0) {
    pagination_query = "";
  } else {
    pagination_query = "LIMIT " + limit + " OFFSET " + offset + "";
  }
  var stringsearch =
    "SELECT * FROM `documents` WHERE client_id='" + client_id + "' AND ";

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
        "%' AND ";
      all_blank = false;
    } else {
    }
  }

  if (all_blank) {
    stringsearch =
      "SELECT * FROM `documents`  WHERE client_id='" + client_id + "' AND ";
  }

  connection.query(
    "" +
      stringsearch +
      " is_deleted = 0 ORDER BY id DESC " +
      pagination_query +
      " ",
    (err, rows, fields) => {
      if (err) {
        //console.log("/category_error" + err)
        res.status(502).send(err);
      } else {
        const countQuery =
          "SELECT COUNT(*) as total_count FROM documents  WHERE client_id='" +
          client_id +
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

//document upload from another user

export function document_upload_another_user(req, res) {
  var { document_title, document_url, document_type, uploaded_by } = req.body;

  if ("client_token" in req.headers) {
    if (
      req.headers.client_token != "" &&
      req.headers.client_token != undefined
    ) {
      var client_token = req.headers.client_token;

      try {
        if (document_title != "") {
          connection.query(
            "select * from clients where client_token='" +
              client_token +
              "' AND is_deleted='0'",
            (err, rows) => {
              if (err) {
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ message: "something went wrong" });
              } else {
                var admin_id = rows[0].admin_id;
                var client_id = rows[0].id;
                var client_name = rows[0].name;

                const folderName =
                  path.join(__dirname, "../../") +
                  `public/document_upload/${client_id}-${client_name}/`;

                try {
                  if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                  }
                } catch (err) {}

                if (document_type === "msword") {
                  document_type = "doc";
                } else if (
                  document_type ===
                  "vnd.openxmlformats-officedocument.wordprocessingml.document"
                ) {
                  document_type = "docx";
                } else if (document_type === "vnd.ms-excel") {
                  document_type = "xls";
                } else if (
                  document_type ===
                  "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ) {
                  document_type = "xlsx";
                }

                try {
                  var rendomNumber = Math.floor(
                    100000 + Math.random() * 900000
                  );
                  var name_str = "" + document_title + "" + rendomNumber + "";

                  fs.writeFileSync(
                    folderName + name_str + "." + document_type + "",
                    document_url,
                    "base64"
                  );
                } catch (err) {}
                // req.protocol + "://" + req.headers.host + "/user_profile/" + req.file.filename;
                connection.query(
                  "INSERT INTO `documents`( `admin_id`, `client_id`,`document_type`,`uploaded_by`, `document_title`, `document_url`) VALUES (" +
                    admin_id +
                    ',"' +
                    client_id +
                    '","' +
                    document_type +
                    '","' +
                    uploaded_by +
                    '","' +
                    document_title +
                    '","' +
                    req.protocol +
                    "://" +
                    req.headers.host +
                    "/document_upload/" +
                    client_id +
                    "-" +
                    client_name +
                    "/" +
                    name_str +
                    "." +
                    document_type +
                    '")',
                  (err, rows, fields) => {
                    if (err) {
                      //console.log(err)
                      res.status(200).send(err);
                    } else {
                      res
                        .status(200)
                        .send({ message: "Document upload successfully" });
                    }
                  }
                );
              }
            }
          );
        } else {
          res.send({ response: "please fill Document name" });
        }
      } catch (error) {
        res
          .status(401)
          .send({ error: "Please authenticate using a valid token" });
      }
    } else {
      res.send({ response: "Client token not in header" });
    }
  } else {
    res.send({ response: "header error" });
  }
}

export function get_document__another_user(req, res) {
  if ("client_token" in req.headers) {
    if (
      req.headers.client_token != "" &&
      req.headers.client_token != undefined
    ) {
      var client_token = req.headers.client_token;

      try {
        connection.query(
          "select * from clients where client_token='" +
            client_token +
            "' AND is_deleted='0'",
          (err, rows) => {
            if (err) {
              res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "something went wrong" });
            } else {
              var client_id = rows[0].id;
              connection.query(
                "SELECT * FROM documents WHERE `client_id`=" +
                  client_id +
                  " AND uploaded_by='another_user' ",
                (err, rows, fields) => {
                  if (err) {
                    //console.log(err)
                    res.status(200).send(err);
                  } else {
                    //console.log("rows")
                    res.status(200).send(rows);
                  }
                }
              );
            }
          }
        );
      } catch (error) {
        res
          .status(401)
          .send({ error: "Please authenticate using a valid token" });
      }
    } else {
      res.send({ response: "Client token not in header" });
    }
  } else {
    res.send({ response: "header error" });
  }
}
