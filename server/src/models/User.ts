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
			return "success";
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
	}
};

export default User;
