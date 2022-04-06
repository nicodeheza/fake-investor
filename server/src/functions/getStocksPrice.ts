import fetch from "node-fetch";
import {redisClientCache} from "../redis/redisConn";

function sliceIntoChunks(arr: any[], chunkSize: number) {
	const res = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		const chunk = arr.slice(i, i + chunkSize);
		res.push(chunk);
	}
	return res;
}

export default async function getStocksPrice(symbols: string[]) {
	const stocksValues = await Promise.all(
		symbols.map(async (symbol) => {
			if (symbol === "FUD") return {symbol, price: 1};
			const redisKey = `stockValue=${symbol}`;
			const res = await redisClientCache.get(redisKey);
			const price: number | null = res === null ? null : parseFloat(res);
			return {symbol, price};
		})
	);

	const apiSymbols = stocksValues.filter((obj) => obj.price === null);
	// console.log(apiSymbols);
	if (apiSymbols.length > 0) {
		const callArr = sliceIntoChunks(apiSymbols, 10);
		let resArr = await Promise.all(
			callArr.map(async (arr) => {
				const symbols = arr.reduce((acc, obj) => acc + obj.symbol + ",", "");
				const response = await fetch(
					`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${symbols}`,
					{
						method: "GET",
						headers: {
							"x-api-key": process.env.YF_API_KEY || "",
							"Content-Type": "application/json"
						}
					}
				);
				const resData = await response.json();
				return resData.quoteResponse.result;
			})
		);
		resArr = resArr.flat();
		resArr = resArr.map((obj) => {
			return {symbol: obj.symbol, price: obj.regularMarketPrice};
		});

		await Promise.all(
			resArr.map((obj) =>
				redisClientCache.setEx(`stockValue=${obj.symbol}`, 3600, obj.price.toString())
			)
		);

		return [...stocksValues.filter((obj) => obj.price), ...resArr];
	} else {
		return stocksValues;
	}
}
