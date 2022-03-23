import "dotenv/config";
import fetch from "node-fetch";
import {Request, Response} from "express";

export default async function SearchStock(req: Request, res: Response) {
	// console.log(req.params.query);
	// const searchParams = new URLSearchParams();
	// searchParams.append("function", "SYMBOL_SEARCH");
	// searchParams.append("keywords", req.params.query);
	// searchParams.append("apikey", process.env.STOCK_API_KEY || "");
	// console.log(searchParams.toString());

	try {
		const apiRes = await fetch(
			`https://yfapi.net/v6/finance/autocomplete?region=US&lang=en&query=${req.params.query}`,
			{
				method: "GET",
				headers: {
					"x-api-key": process.env.YF_API_KEY || "",
					"Content-Type": "application/json"
				}
			}
		);
		const data = await apiRes.json();
		console.log(data);
		res.status(200).json(data);
	} catch (err) {
		console.log(err);
	}
}
