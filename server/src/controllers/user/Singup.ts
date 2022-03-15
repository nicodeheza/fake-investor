import express from "express";
import User from "../../models/User";
import {createHash} from "../../functions/password";

export default async function Singup(req: express.Request, res: express.Response) {
	try {
		const {email, userName, password, repeat} = req.body;
		const emailRegEX = new RegExp(".+@.+");
		if (!emailRegEX.test(email)) {
			res.status(400).json({message: "Please enter a valid email."});
		}

		const hashSalt: any = await createHash(password);
		const saveUser: any = await User.saveNewUser(
			userName,
			email,
			hashSalt.hash,
			hashSalt.salt
		);
		console.log("user save: ", saveUser);

		if (saveUser === "success") {
			// log in
		} else {
			if (saveUser.includes("Users.email")) {
				res
					.status(400)
					.json({message: "There is already an account associated with that email"});
			} else {
				res.status(400).json({message: "Error"});
			}
		}
	} catch (err) {
		console.log(err);
	}
}
