import "dotenv/config";
import fetch from "node-fetch";
import {Request, Response} from "express";

export default async function SearchStock(req: Request, res: Response) {
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
		res.status(200).json(data);
	} catch (err) {
		console.log(err);
	}
}
