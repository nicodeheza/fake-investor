import {Request, Response} from "express";
import user from "../../models/UserType";

export default function Login(req: Request, res: Response) {
	// console.log(req.user);
	const user: user | undefined = req.user;
	console.log(user?.user_name);
	res.status(200).json({userName: user?.user_name});
}
