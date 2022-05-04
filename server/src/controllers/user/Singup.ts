import express from "express";
import User from "../../models/User";
import Stock from "../../models/Stock";
import {createHash} from "../../functions/password";
import passport from "passport";

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

		if (saveUser[0] === "success") {
			const fudId = await Stock.getIdFromSymbol("FUD");
			await User.addStockOwnership(saveUser[1], fudId!, 1000000);
			passport.authenticate("local", (err, user, info) => {
				if (err) throw err;
				if (!user) res.json({message: "No User Exists"});
				else {
					req.logIn(user, (err) => {
						if (err) throw err;
						res.json({userName: user.user_name});
					});
				}
			})(req, res);
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
