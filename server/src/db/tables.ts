import db from "./db";

export default async function createTables() {
	await db.promise().execute(`CREATE TABLE IF NOT EXISTS Users(
        user_id INT AUTO_INCREMENT NOT NULL UNIQUE , 
        user_name VARCHAR(127) NOT NULL , 
        email VARCHAR(127) NOT NULL UNIQUE , 
        hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        start_day DATE DEFAULT(CURRENT_DATE),
        PRIMARY KEY (user_id)
    )`);

	await db.promise().execute(`
    CREATE TABLE IF NOT EXISTS Stocks(
        stock_id INT AUTO_INCREMENT NOT NULL UNIQUE , 
        stock_name VARCHAR(127) NOT NULL UNIQUE , 
        symbol VARCHAR(127) NOT NULL UNIQUE , 
        PRIMARY KEY (stock_id)
    )`);

	const [row] = await db.promise().execute(`
    SELECT * FROM Stocks WHERE symbol= "FUD"
    `);
	const a: any = row;
	if (a.length === 0) {
		await db.promise().execute(`
        INSERT INTO Stocks (stock_name, symbol) VALUES("Fake Us Dolar", "FUD")
        `);
	}

	await db.promise().execute(`
    CREATE TABLE IF NOT EXISTS Ownerships(
        user_id INT, 
        stock_id INT, 
        quantity DECIMAL(25, 4),
        PRIMARY KEY (user_id, stock_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES Stocks (stock_id) ON DELETE CASCADE
    )`);
	await db.promise().execute(`
    CREATE TABLE IF NOT EXISTS History(
        history_id INT AUTO_INCREMENT NOT NULL UNIQUE, 
        history_date DATE DEFAULT(CURRENT_DATE), 
        user_id INT,
        portfolio_value DECIMAL(25, 4),
        liquid DECIMAL(25, 4),
        PRIMARY KEY (history_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )`);

	await db.promise().execute(`
    CREATE TABLE IF NOT EXISTS Transactions(
        transaction_id INT AUTO_INCREMENT NOT NULL UNIQUE, 
        history_id INT, 
        stock_id INT,
        buy BOOL,
        price DECIMAL(25, 4),
        quantity INT,
        PRIMARY KEY (transaction_id),
        FOREIGN KEY (history_id) REFERENCES History(history_id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES Stocks(stock_id) ON DELETE CASCADE
    )`);
}
