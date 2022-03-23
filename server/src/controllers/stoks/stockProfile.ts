import {Request, Response} from "express";
import fetch from "node-fetch";
import apiUrl from "../../functions/apiUrl";

export default async function stockProfile(req: Request, res: Response) {
	const sendData = {
		daily: {},
		weekly: {},
		monthly: {}
	};
	const aFunctions = ["TIME_SERIES_DAILY", "TIME_SERIES_WEEKLY", "TIME_SERIES_MONTHLY"];
	const urls = aFunctions.map((f) => apiUrl(f, req.params.symbol));
	//console.log(urls);

	try {
		const data = await Promise.all(
			urls.map(async (url) => {
				const resp = await fetch(url);
				return await resp.json();
			})
		);
		// console.log(data);

		data.forEach((obj) => {
			console.log(obj);
			if ("Time Series (Daily)" in obj) {
				// console.log("d");
				sendData.daily = obj["Time Series (Daily)"];
			} else if ("Weekly Time Series" in obj) {
				// console.log("w");
				sendData.weekly = obj["Weekly Time Series"];
			} else if ("Monthly Time Series" in obj) {
				// console.log("m");
				sendData.monthly = obj["Monthly Time Series"];
			}
		});
		console.log("----------------");
		// console.log(sendData.daily);
		//console.log("stockProfile");
		res.status(200).json(sendData);
	} catch (err) {
		console.log(err);
	}
}
