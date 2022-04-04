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
	}
};

export default User;
