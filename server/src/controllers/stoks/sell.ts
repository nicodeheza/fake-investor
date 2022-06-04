import {Request, Response} from "express";
import updateOrCreateToDayHistory from "../../functions/updateOrCreateToDayHistory";
import Stock from "../../models/Stock";
import User from "../../models/User";

export default async function sell(req: Request, res: Response) {
	const {
		symbol,
		name,
		amount,
		price
	}: {
		symbol: string;
		name: string;
		amount: number;
		price: number;
	} = req.body;
	const userId: number = (req.user as {[key: string]: any}[])[0].user_id;
	try {
		await User.addFud(userId, amount * price);

		const stockId = await Stock.getIdFromSymbol(symbol);

		const currentHolding = await User.getStockHolding(userId, stockId!);
		await User.updateStockQuantity(stockId!, userId, currentHolding! - amount);

		const historyId = await updateOrCreateToDayHistory(userId);

		await User.addTransaction(historyId, stockId!, false, price, amount);

		res.status(200).json({message: "ok"});
	} catch (err) {
		console.log(err);
		if (err === "Limit Exceeded") {
			res.status(502).json({message: err});
		} else {
			res.status(500).json({message: err});
		}
	}
}
