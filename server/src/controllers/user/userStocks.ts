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

		const valsObj = vals.reduce(
			(acc, curr) => ({...acc, [curr.symbol]: {price: curr.price, change: curr.change}}),
			{}
		);

		const result = (stocks as {[key: string]: string}[]).map((obj) => {
			const fullName = obj.stock_name;
			const symbol = obj.symbol;
			const price = valsObj[obj.symbol].price;
			const change = valsObj[obj.symbol].change;
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
