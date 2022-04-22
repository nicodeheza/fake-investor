import User from "../models/User";
import getHistoricalOwnerships from "./getHistoricalOwnerships";
import getStockHistoricalPrice from "./getStockHistoricalPrice";

export interface historyPoints {
	[key: string]: {
		portfolioValue: number;
		liquid: number;
		transactions: {price: number; quantity: number; buy: boolean; symbol: string}[] | [];
	};
}

export default async function fillUserHistoryPoints(
	userId: number,
	historyPoints: historyPoints
) {
	try {
		// console.log(historyPoints);
		const hp = {...historyPoints};
		const dates = Object.keys(hp);
		let complete = true;
		for (let i = 0; i < dates.length; i++) {
			if (hp[dates[i + 1]]) {
				const dateDiff = parseInt(dates[i + 1]) - parseInt(dates[i]);
				const oneDay = 1000 * 60 * 60 * 24;
				if (dateDiff > oneDay) {
					// get dates[i] ownership
					const ownership = await getHistoricalOwnerships(
						new Date(parseInt(dates[i])),
						userId
					);
					complete = false;
					const datesToComplete = dateDiff / oneDay;
					for (let j = 0; j < datesToComplete; j++) {
						const date = parseInt(dates[i]) + (j + 1) * oneDay;
						const datePrices = await getStockHistoricalPrice(
							Object.keys(ownership!).map((symbol) => {
								return {
									symbol,
									date
								};
							})
						);
						// console.log("datePrice: ", datePrices);
						const totalStockPrice = datePrices?.reduce((prev, curr) => {
							return prev + ownership![curr.symbol] * curr.price;
						}, 0);
						hp[date] = {
							portfolioValue: totalStockPrice! + hp[dates[i]].liquid,
							liquid: hp[dates[i]].liquid,
							transactions: []
						};
						// console.log(userId, hp[date].portfolioValue, hp[date].liquid, new Date(date));
						await User.addHistory(
							userId,
							hp[date].portfolioValue,
							hp[date].liquid,
							new Date(date)
						);
					}
				}
			}
		}
		if (complete) return historyPoints;
		return hp;
	} catch (err) {
		console.log(err);
	}
}
