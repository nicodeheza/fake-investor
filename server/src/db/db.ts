import mysql from "mysql2";
import "dotenv/config";

const db = mysql.createConnection({
	host: "127.0.0.1",
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: "fakeInversor",
	port: 3307
});

export default db;
