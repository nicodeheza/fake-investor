import {Request, Response} from "express";
import getStocksPrice from "../../functions/getStocksPrice";
import User from "../../models/User";
// import Stock from "../../models/Stock";

export default async function buyCard(req: Request, res: Response) {
	try {
		const user: any = req.user;
		const userId: number = user[0].user_id;
		const userStocks: any = await User.getAllStock(userId);
		const [fuds] = userStocks.filter(
			(obj: {symbol: string; quantity: string}) => obj.symbol === "FUD"
		);
		// console.log("su: ", fuds);
		if (userStocks.length === 1) {
			res.status(200).json({
				fud: parseFloat(fuds.quantity),
				portfolioV: parseFloat(fuds.quantity)
			});
		} else {
			const stocksPrice = await getStocksPrice(
				userStocks.map((obj: {symbol: string; quantity: string}) => obj.symbol)
			);
			const porfolio: {
				[key: string]: number;
			} = {};
			userStocks.forEach((obj: {symbol: string; quantity: string}, i: number) => {
				porfolio[obj.symbol] = parseInt(obj.quantity);
			});
			let portfolioVal: number = 0;
			stocksPrice.forEach((obj: {symbol: string; price: number}) => {
				portfolioVal += obj.price * porfolio[obj.symbol];
			});

			res.status(200).json({
				fud: parseFloat(fuds.quantity),
				portfolioV: portfolioVal
			});
		}
	} catch (err) {
		console.log(err);
	}
}
