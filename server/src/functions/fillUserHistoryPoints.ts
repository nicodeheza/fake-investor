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
		const hp = {...historyPoints};
		const dates = Object.keys(hp).sort();
		let complete = true;
		for (let i = 0; i < dates.length; i++) {
			if (hp[dates[i + 1]]) {
				const dateDiff = parseInt(dates[i + 1]) - parseInt(dates[i]);
				// console.log("nn: ", new Date(parseInt(dates[i + 1])));
				const oneDay = 1000 * 60 * 60 * 24;
				if (dateDiff > oneDay) {
					// get dates[i] ownership
					const ownership = await getHistoricalOwnerships(
						new Date(parseInt(dates[i])),
						userId
					);
					complete = false;
					const datesToComplete = dateDiff / oneDay;
					// console.log("datesToComplete", datesToComplete);
					for (let j = 0; j < datesToComplete - 1; j++) {
						const date = parseInt(dates[i]) + (j + 1) * oneDay;
						// console.log("date: ", new Date(date));
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
