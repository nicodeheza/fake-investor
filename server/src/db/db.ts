import mysql from "mysql2";
import "dotenv/config";

const db = mysql.createConnection({
	host: process.env.NODE_ENV === "production" ? "mysql" : "127.0.0.1",
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.NODE_ENV === "test" ? "fakeInversorTest" : "fakeInversor",
	port: parseInt(process.env.MYSQL_PORT || "3307")
});

export default db;
