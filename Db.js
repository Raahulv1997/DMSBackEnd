import mysql from "mysql2";
import "dotenv/config";

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "we2code",
//   password: "we2code",
//   database: "DocumentDb",
// });

// const connection = mysql.createConnection({
//   host: "mysql.indiakinursery.com",
//   user: "indiakinursery",
//   password: "WE2code@2023",
//   database: "documentdb",
// });

const connection = mysql.createConnection({
  host: "mysql.indiakinursery.com",
  user: "indiakinursery",
  password: "WE2code@2023",
  database: "documentdb",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default connection;
