import fetch from "node-fetch";
import {redisClientCache} from "../redis/redisConn";
import sliceIntoChunks from "./sliceIntoChunks";

interface stockVal {
	price: number;
	change: number;
}

export default async function getStocksData(symbols: string[]) {
	const stocksValues = await Promise.all(
		symbols.map(async (symbol) => {
			if (symbol === "FUD") return {symbol, price: 1, change: ""};
			const redisKey = `stockValue=${symbol}`;
			const res = await redisClientCache.get(redisKey);

			if (res === null) return {symbol, price: null, change: null};

			const vals: stockVal = JSON.parse(res);
			return {symbol, price: vals?.price, change: vals?.change};
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
			return {
				symbol: obj.symbol,
				price: obj.regularMarketPrice,
				change: obj.regularMarketChangePercent
			};
		});

		await Promise.all(
			resArr.map((obj) =>
				redisClientCache.setEx(
					`stockValue=${obj.symbol}`,
					3600,
					JSON.stringify({price: obj.price, change: obj.change})
				)
			)
		);

		return [...stocksValues.filter((obj) => obj.price), ...resArr];
	} else {
		return stocksValues;
	}
}
