import {Request, Response} from "express";
import fetch from "node-fetch";

type sendData = {
	lastPrice?: number;
	dailyVariationMon?: number;
	dailyVariationPer?: number;
	monthlyVariationMon?: number;
	monthlyVariationPer?: number;
	last12Mon?: number | null;
	last12Per?: number | null;
	volume?: number;
	avgVolume?: number;
	userProp?: boolean;
};

export default async function stockProfile(req: Request, res: Response) {
	// console.log(req.params.symbol);
	const sendData: sendData = {};

	const dailyParams = new URLSearchParams();
	dailyParams.append("function", "TIME_SERIES_DAILY");
	dailyParams.append("symbol", req.params.symbol);
	dailyParams.append("apikey", process.env.STOCK_API_KEY || "");

	const monthlyParams = new URLSearchParams();
	monthlyParams.append("function", "TIME_SERIES_MONTHLY");
	monthlyParams.append("symbol", req.params.symbol);
	monthlyParams.append("apikey", process.env.STOCK_API_KEY || "");

	try {
		const dailyApiRes = await fetch(
			`https://www.alphavantage.co/query?${dailyParams.toString()}`
		);
		const monthlyApiRes = await fetch(
			`https://www.alphavantage.co/query?${monthlyParams.toString()}`
		);
		const dailyData = await dailyApiRes.json();
		const dd = dailyData["Time Series (Daily)"];
		const monthlyData = await monthlyApiRes.json();
		const md = monthlyData["Monthly Time Series"];

		const dailyKeys = Object.keys(dd);
		const monthlyKeys = Object.keys(md);
		//last price
		sendData.lastPrice = parseFloat(dd[dailyKeys[0]]["4. close"]);
		//daily variation  (price and percentage)
		sendData.dailyVariationMon =
			sendData.lastPrice - parseFloat(dd[dailyKeys[1]]["4. close"]);
		sendData.dailyVariationPer = (sendData.dailyVariationMon * 100) / sendData.lastPrice;
		//monthly variation
		sendData.monthlyVariationMon =
			parseFloat(md[monthlyKeys[0]]["4. close"]) -
			parseFloat(md[monthlyKeys[1]]["4. close"]);
		sendData.monthlyVariationPer =
			(sendData.monthlyVariationMon * 100) / parseFloat(md[monthlyKeys[0]]["4. close"]);
		//last 12 month Variation
		if (monthlyKeys.length >= 12) {
			sendData.last12Mon =
				parseFloat(md[monthlyKeys[0]]["4. close"]) -
				parseFloat(md[monthlyKeys[11]]["4. close"]);
			sendData.last12Per =
				(sendData.last12Mon * 100) / parseFloat(md[monthlyKeys[0]]["4. close"]);
		} else {
			sendData.last12Mon = null;
			sendData.last12Per = null;
		}
		//volume
		sendData.volume = parseInt(md[monthlyKeys[0]]["5. volume"]);
		//avg.volume(3m)
		sendData.avgVolume =
			(parseInt(md[monthlyKeys[0]]["5. volume"]) +
				parseInt(md[monthlyKeys[1]]["5. volume"]) +
				parseInt(md[monthlyKeys[2]]["5. volume"])) /
			3;
		//user have it (to do)
		console.log(req.user);
		sendData.userProp = false; //change it later

		res.status(200).json(sendData);
	} catch (err) {
		console.log(err);
	}
}
