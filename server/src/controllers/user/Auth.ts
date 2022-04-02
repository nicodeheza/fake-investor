import {Request, Response} from "express";
import user from "../../models/UserType";

export default function Auth(req: Request, res: Response) {
	const user: any = req.user;
	// console.log("user name is: ", user[0].user_name);
	res.status(200).json({userName: user[0].user_name});
}
