import {Request, Response} from "express";
import user from "../../models/UserType";

export default function Login(req: Request, res: Response) {
	const user: user | undefined = req.user;
	res.status(200).json({userName: user?.user_name});
}
