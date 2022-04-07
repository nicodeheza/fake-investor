import {Request, Response} from "express";
import getPortfolioVal from "../../functions/getPortfolioVal";
import updateOrCreateToDayHistory from "../../functions/updateOrCreateToDayHistory";
import Stock from "../../models/Stock";
import User from "../../models/User";

export default async function buy(req: Request, res: Response) {
	// console.log("body: ", req.body);
	const {amount, symbol, name, price} = req.body;

	try {
		//get stock id or create it
		let stockId = await Stock.getIdFromSymbol(symbol);
		if (!stockId) stockId = await Stock.addStock(symbol, name);
		//user id
		const user: any = req.user;
		const userId: number = user[0].user_id;
		//update o create holding
		const stockHolding = await User.getStockHolding(userId, stockId!);
		if (!stockHolding) {
			await User.addStockOwnership(userId, stockId!, amount);
		} else {
			await User.updateStockQuantity(stockId!, userId, stockHolding + amount);
		}
		//subtract fud
		await User.subtractFud(userId, price * amount);
		//create or update user history point
		const historyId = await updateOrCreateToDayHistory(userId);
		//create transaction
		await User.addTransaction(historyId, stockId!, true, price, amount);
		res.status(200).json({message: "ok"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: err});
	}
}
