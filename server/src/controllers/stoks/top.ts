import {Response, Request} from "express";
import getStocksData from "../../functions/getStocksData";
import Stock from "../../models/Stock";

type topStocks = {
	symbol: string;
	stock_name: string;
	"buys-num": string;
}[];

type stockData = {
	symbol: string;
	price: number;
	change: number;
}[];

export default async function top(req: Request, res: Response) {
	try {
		const topStocks = await Stock.getTopSymbols();
		const stocksData: stockData = await getStocksData(
			(topStocks as topStocks).map((ele) => ele.symbol)
		);

		const top: {
			[key: number]: {
				name: string;
				symbol: string;
				price: number;
				variation: number;
			};
		} = {};
		(topStocks as topStocks).forEach((ele, i) => {
			const ranking = i + 1;
			const name = `${ele.stock_name}(${ele.symbol})`;
			const [data] = stocksData.filter((obj) => obj.symbol === ele.symbol);
			const price = data.price;
			const variation = (data.change * 100) / price;
			top[ranking] = {
				name,
				symbol: ele.symbol,
				price,
				variation
			};
		});
		res.status(200).json(top);
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
}
