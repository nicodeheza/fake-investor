import db from "../db/db";
const User = {
	findUserByEmail: async (user: string) => {
		try {
			const [rows] = await db
				.promise()
				.query("SELECT * FROM `Users` WHERE email= ?", [user]);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},
	saveNewUser: async (userName: string, email: string, hash: string, salt: string) => {
		try {
			const [rows] = await db
				.promise()
				.query("INSERT INTO  Users ( user_name, email, hash, salt ) VALUES(?, ?, ?, ?)", [
					userName,
					email,
					hash,
					salt
				]);
			// console.log(rows.toString());
			return ["success", (<{[key: string]: any}>rows).insertId];
		} catch (err: any) {
			// console.log(err);
			return err.sqlMessage;
		}
	},
	findById: async (id: number) => {
		try {
			const [rows] = await db
				.promise()
				.query("SELECT * FROM Users WHERE user_id=?", [id]);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},
	addStockOwnership: async (userId: number, stockId: number, amount: number) => {
		try {
			await db
				.promise()
				.query(`INSERT INTO Ownerships(user_id, stock_id, quantity) VALUES (?, ?, ?)`, [
					userId,
					stockId,
					amount
				]);
		} catch (err) {
			console.log(err);
		}
	},
	getStockHolding: async (userId: number, stockId: number) => {
		try {
			const [rows] = await db.promise().query(
				`
			SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
			`,
				[userId, stockId]
			);

			return parseInt((<{quantity: string}[]>rows)[0]?.quantity);
		} catch (err) {
			console.log(err);
		}
	},
	getAllStock: async (userId: number) => {
		try {
			const [rows] = await db.promise().query(
				`
			SELECT Stocks.symbol, Ownerships.quantity FROM Stocks 
			JOIN Ownerships ON Stocks.stock_id=Ownerships.stock_id
			WHERE Ownerships.user_id= ?
			`,
				[userId]
			);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},
	updateStockQuantity: async (stockId: number, userId: number, newVal: number) => {
		try {
			await db.promise().query(
				`
			UPDATE Ownerships SET quantity=?
			WHERE user_id=? AND stock_id=?
			`,
				[newVal, userId, stockId]
			);
		} catch (err) {
			console.log(err);
		}
	},
	subtractFud: async (userId: number, amount: number) => {
		try {
			const [row] = await db.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
			const fudId = (<{stock_id: number}[]>row)[0].stock_id;
			console.log(fudId);
			await db.promise().query(
				`
			UPDATE Ownerships  SET quantity= quantity - ?
			WHERE user_id=? AND stock_id=?
			`,
				[amount, userId, fudId]
			);
		} catch (err) {
			console.log(err);
		}
	},
	getToDayHistory: async (userId: number) => {
		try {
			const [rows] = await db.promise().query(
				`
			SELECT * FROM History WHERE user_id= ? AND history_date=CURRENT_DATE
				`,
				[userId]
			);

			return (rows as {}[])[0];
		} catch (err) {
			console.log(err);
		}
	},
	addHistory: async (
		userId: number,
		portfolioVal: number,
		liquid: number,
		date?: Date
	) => {
		try {
			if (!date) {
				const [rows] = await db.promise().query(
					`
				INSERT INTO History (user_id, portfolio_value, liquid) 
				VALUES (?,?,?)
				`,
					[userId, portfolioVal, liquid]
				);
				return rows;
			} else {
				const [rows] = await db.promise().query(
					`
				INSERT INTO History (user_id, portfolio_value, liquid, history_date)
				VALUES (?,?,?)
				`,
					[userId, portfolioVal, liquid, date]
				);
				return rows;
			}
		} catch (err) {
			console.log(err);
		}
	},
	getFudQuantity: async (userId: number) => {
		try {
			const [row] = await db.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
			const fudId = (<{stock_id: number}[]>row)[0].stock_id;

			const [rows] = await db.promise().query(
				`
			SELECT quantity FROM Ownerships 
			WHERE user_id=? AND stock_id=?
			`,
				[userId, fudId]
			);
			return parseFloat((rows as {quantity: string}[])[0].quantity);
		} catch (err) {
			console.log(err);
		}
	},
	updateHistory: async (historyId: number, portfolioVal: number, liquid: number) => {
		try {
			await db.promise().query(
				`
			UPDATE History SET portfolio_value=?, liquid=? 
			WHERE history_id=?
			`,
				[portfolioVal, liquid, historyId]
			);
		} catch (err) {
			console.log(err);
		}
	},
	addTransaction: async (
		historyId: number,
		stockId: number,
		buy: boolean,
		price: number,
		quantity: number
	) => {
		try {
			await db.promise().query(
				`
			INSERT INTO Transactions (history_id, stock_id, buy, price, quantity)
			VALUES (?,?,?,?,?)
			`,
				[historyId, stockId, buy, price, quantity]
			);
		} catch (err) {
			console.log(err);
		}
	}
};

export default User;
