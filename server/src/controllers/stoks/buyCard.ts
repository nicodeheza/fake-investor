import {Request, Response} from "express";
// import getStocksPrice from "../../functions/getStocksPrice";
import User from "../../models/User";
import getPortfolioVal from "../../functions/getPortfolioVal";
// import Stock from "../../models/Stock";

export default async function buyCard(req: Request, res: Response) {
	try {
		const user: any = req.user;
		const userId: number = user[0].user_id;

		const fud = await User.getFudQuantity(userId);
		const portfolioV = await getPortfolioVal(userId);

		res.status(200).json({
			fud,
			portfolioV
		});
	} catch (err) {
		console.log(err);
	}
}
