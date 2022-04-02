import {Request, Response} from "express";
import fetch from "node-fetch";
import {redisClientCache} from "../../redis/redisConn";

export default async function stockProfile(req: Request, res: Response) {
	const redisKey = `stockProfile=${req.params.symbol}`;
	let data;
	try {
		const cashData = await redisClientCache.get(redisKey);
		// console.log(cashData);
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
			console.log("api");
		} else {
			data = JSON.parse(cashData);
			console.log("redis");
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
			userProp: false
		};
		res.status(200).json(sendData);
	} catch (err) {
		console.log(err);
	}
}
