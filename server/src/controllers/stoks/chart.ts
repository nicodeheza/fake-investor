import {Request, Response} from "express";
import fetch from "node-fetch";

export default async function chart(req: Request, res: Response) {
	const ticker = req.params.symbol.toUpperCase();
	try {
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
		const resData = await response.json();
		console.log(resData);
		const d: number[] = resData.chart.result[0].timestamp;
		// console.log(d.length);
		// d.forEach((date: number) => console.log(new Date(date * 1000)));
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
	}
}
