import {Request, Response} from "express";
import User from "../../models/User";

export default async function resetUser(req: Request, res: Response) {
	try {
		const userId: number = (req.user as {[key: string]: any}[])[0].user_id;
		console.log("ok");

		await Promise.all([
			User.deleteUserHistory(userId),
			User.deleteUserOwnerships(userId),
			User.createUfdOwnership(userId)
		]);

		res.status(200).json({message: "SUCCESS"});
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
}
