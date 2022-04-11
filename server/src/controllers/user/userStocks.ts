import {Request, Response} from "express";
import getStocksData from "../../functions/getStocksData";
import User from "../../models/User";

interface stockData {
	fullName: string;
	symbol: string;
	price: number;
	change: number;
	quaNum: number;
	quaMon: number;
}

export default async function userStocks(req: Request, res: Response) {
	try {
		const userId = (req.user as {[key: string]: any}[])[0].user_id;
		const stocks = await User.getAllStock(userId);
		const vals = await getStocksData(
			(stocks as {[key: string]: string}[]).map((obj) => obj.symbol)
		);
		// console.log("stocks: ", stocks);
		// console.log("vals: ", vals);

		const result = (stocks as {[key: string]: string}[]).map((obj) => {
			const fullName = obj.stock_name;
			const symbol = obj.symbol;
			const valIndex = vals.findIndex((o) => o.symbol === symbol);
			const price = vals[valIndex].price;
			const change = vals[valIndex].change;
			const quaNum = parseInt(obj.quantity);
			const quaMon = quaNum * price;
			const r: stockData = {
				fullName,
				symbol,
				price,
				change,
				quaNum,
				quaMon
			};
			return r;
		});
		res.status(200).json(result);
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
}
