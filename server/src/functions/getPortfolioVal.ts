import User from "../models/User";
import getStocksPrice from "./getStocksPrice";

export default async function (userId: number) {
	try {
		const userStocks: any = await User.getAllStock(userId);
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

		return portfolioVal;
	} catch (err) {
		console.log(err);
	}
}
