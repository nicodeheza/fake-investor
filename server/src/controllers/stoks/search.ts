import "dotenv/config";
import fetch from "node-fetch";
import {Request, Response} from "express";

export default async function SearchStock(req: Request, res: Response) {
	// console.log(req.params.query);
	const searchParams = new URLSearchParams();
	searchParams.append("function", "SYMBOL_SEARCH");
	searchParams.append("keywords", req.params.query);
	searchParams.append("apikey", process.env.STOCK_API_KEY || "");
	// console.log(searchParams.toString());

	try {
		const apiRes = await fetch(
			`https://www.alphavantage.co/query?${searchParams.toString()}`
		);
		const data = await apiRes.json();
		res.status(200).json(data);
	} catch (err) {
		console.log(err);
	}
}
