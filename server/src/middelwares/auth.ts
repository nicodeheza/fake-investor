import {Request, Response, NextFunction} from "express";

export default function checkAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.json({userName: ""});
}
