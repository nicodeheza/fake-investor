import {Request, Response} from "express";
import getPortfolioVal from "../../functions/getPortfolioVal";
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
		let historyPoint: any = await User.getToDayHistory(userId);
		let historyId: number;
		const portfolioVal = await getPortfolioVal(userId);
		const liquid = await User.getFudQuantity(userId);
		if (!historyPoint) {
			console.log("not history");
			const h = await User.addHistory(userId, portfolioVal!, liquid!);
			historyId = (h as {[key: string]: any}).insertId;
		} else {
			console.log(historyPoint);
			historyId = historyPoint.history_id;
			await User.updateHistory(historyId, portfolioVal!, liquid!);
		}
		//create transaction
		await User.addTransaction(historyId, stockId!, true, price, amount);
		res.status(200).json({message: "ok"});
	} catch (err) {
		console.log(err);
		res.status(500).json({message: err});
	}
}
