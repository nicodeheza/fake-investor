import {Request, Response} from "express";
import fetch from "node-fetch";

export default async function stockProfile(req: Request, res: Response) {
	try {
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
		const data = resData.quoteResponse.result[0];

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
		// console.log(sendData);
		res.status(200).json(sendData);
	} catch (err) {
		console.log(err);
	}
}
