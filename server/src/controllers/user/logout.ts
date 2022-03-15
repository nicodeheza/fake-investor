import {Request, Response} from "express";

export default function logout(req: Request, res: Response) {
	res.json({userName: ""});
}
