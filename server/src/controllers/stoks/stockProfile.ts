import {Request, Response} from "express";
import fetch from "node-fetch";
import {redisClientCache} from "../../redis/redisConn";
import Stock from "../../models/Stock";
import User from "../../models/User";

export default async function stockProfile(req: Request, res: Response) {
	const redisKey = `stockProfile=${req.params.symbol}`;
	let data;
	try {
		const cashData = await redisClientCache.get(redisKey);
		if (!cashData) {
			const response = await fetch(
				`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${req.params.symbol}`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
			const resData = await response.json();
			data = resData.quoteResponse.result[0];
			redisClientCache.setEx(redisKey, 3600, JSON.stringify(data));
			console.log("stockProfile api");
		} else {
			data = JSON.parse(cashData);
			console.log("stockProfile redis");
		}

		let userHave: number | boolean;

		if (req.user) {
			const stockId = await Stock.getIdFromSymbol(req.params.symbol);
			if (stockId) {
				const user: any = req.user;
				const userId: number = user[0].user_id;
				userHave = (await User.getStockHolding(userId, stockId)) || 0;
			} else {
				userHave = 0;
			}
		} else {
			userHave = false;
		}
		const sendData = {
			longName: data.longName,
			regularMarketPrice: data.regularMarketPrice,
			regularMarketChange: data.regularMarketChange,
			regularMarketChangePercent: data.regularMarketChangePercent,
			regularMarketPreviousClose: data.regularMarketPreviousClose,
			regularMarketOpen: data.regularMarketOpen,
			regularMarketDayRange: data.regularMarketDayRange,
			fiftyTwoWeekRange: data.fiftyTwoWeekRange,
			regularMarketVolume: data.regularMarketVolume,
			averageDailyVolume3Month: data.averageDailyVolume3Month,
			userProp: userHave!
		};
		res.status(200).json(sendData);
	} catch (err) {
		console.log(err);
		res.status(500).json({message: "Nonexistent symbol"});
	}
}
