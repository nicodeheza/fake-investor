import {Request, Response} from "express";

export default function Auth(req: Request, res: Response) {
	if (req.isAuthenticated()) {
		const user: any = req.user;
		res.status(200).json({userName: user[0].user_name});
	} else {
		res.status(200).json({userName: ""});
	}
}
