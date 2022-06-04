import {Request, Response} from "express";
import fetch from "node-fetch";
import {redisClientCache} from "../../redis/redisConn";

export default async function chart(req: Request, res: Response) {
	const ticker = req.params.symbol.toUpperCase();
	const redisKey = `stockChart=${ticker}`;
	let resData;
	try {
		const redisData = await redisClientCache.get(redisKey);
		if (!redisData) {
			const response = await fetch(
				`https://yfapi.net/v8/finance/chart/${ticker}?range=5y&region=US&interval=1d&lang=en`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
			resData = await response.json();
			if (resData.message === "Limit Exceeded") throw resData.message;

			await redisClientCache.setEx(redisKey, 3600, JSON.stringify(resData));
			console.log("stock chart api");
		} else {
			resData = JSON.parse(redisData);
			console.log("stock chart redis");
		}
		const d: number[] = resData.chart.result[0].timestamp;

		const jsTimestamp = d.map((n) => n * 1000);
		const resObj = {
			timestamp: jsTimestamp,
			close: resData.chart.result[0].indicators.quote[0].close,
			low: resData.chart.result[0].indicators.quote[0].low,
			open: resData.chart.result[0].indicators.quote[0].open,
			high: resData.chart.result[0].indicators.quote[0].high
		};
		res.status(200).json(resObj);
	} catch (err) {
		console.log(err);
		if (err === "Limit Exceeded") {
			res.status(502).json({message: err});
		} else {
			res.status(500).json({message: err});
		}
	}
}
