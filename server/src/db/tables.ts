import db from "./db";

export default async function createTables() {
	await db.promise().execute(`CREATE TABLE IF NOT EXISTS Users(
        user_id INT AUTO_INCREMENT NOT NULL UNIQUE , 
        user_name VARCHAR(127) NOT NULL UNIQUE , 
        email VARCHAR(127) NOT NULL UNIQUE , 
        hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        start_day DATE DEFAULT(CURRENT_DATE),
        PRIMARY KEY (user_id)
    )`);
}
