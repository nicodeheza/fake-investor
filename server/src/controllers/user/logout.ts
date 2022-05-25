import {Request, Response} from "express";

export default function logout(req: Request, res: Response) {
	req.logOut();
	res.status(200).json({userName: ""});
}
