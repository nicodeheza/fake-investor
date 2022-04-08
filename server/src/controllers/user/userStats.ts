import {Request, Response} from "express";
import User from "../../models/User";
import Stock from "../../models/Stock";
import getPortfolioVal from "../../functions/getPortfolioVal";

export default async function (req: Request, res: Response) {
	try {
		const userId = (req.user as {[key: string]: any}[])[0].user_id;
		const fudId = await Stock.getIdFromSymbol("FUD");
		const portfolioVal = await getPortfolioVal(userId);
		const liquidMon = await User.getStockHolding(userId, fudId!);
		const liquidPer = (liquidMon! * 100) / portfolioVal!;
		const stocksMon = portfolioVal! - liquidMon!;
		const stocksPer = (stocksMon * 100) / portfolioVal!;
		const gainMony = portfolioVal! - 1000000;
		const gainPer = (gainMony * 100) / 1000000;

		res.status(200).json({
			gainMony,
			gainPer,
			liquidMon,
			liquidPer,
			stocksMon,
			stocksPer,
			total: portfolioVal
		});
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
}
