import {redisClientCache} from "../redis/redisConn";
import fetch from "node-fetch";
import sliceIntoChunks from "./sliceIntoChunks";

export default async function getStockHistoricalPrice(
	stocksDate: {symbol: string; date: number}[]
) {
	try {
		const symbols = stocksDate.map((obj) => obj.symbol);
		const cacheDataRes = await Promise.all(
			symbols.map((s) => {
				return redisClientCache.get(`stockHistory=${s}`);
			})
		);

		const data: {[key: string]: any} = {};
		for (let i = 0; i < cacheDataRes.length; i++) {
			const ele = cacheDataRes[i] ? JSON.parse(<string>cacheDataRes[i]) : null;
			if (ele) {
				data[ele.symbol] = ele;
				const symbolIndex = symbols.findIndex((e) => e === ele.symbol);
				if (symbolIndex >= 0) {
					symbols.splice(symbolIndex, 1);
				}
			}
		}

		if (symbols.length > 0) {
			const chunkSymbols = sliceIntoChunks(symbols, 10);
			for (let i = 0; i < chunkSymbols.length; i++) {
				const sym = chunkSymbols[i];
				const response = await fetch(
					`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=${sym.join()}`,
					{
						method: "GET",
						headers: {
							"x-api-key": process.env.YF_API_KEY || "",
							"Content-Type": "application/json"
						}
					}
				);
				const fetchData = await response.json();
				console.log("getStockHistoricalPrice api call");
				// console.log("fetchData: ", fetchData);
				//probar todo el controlador ya no puedo Limit Exceeded y ver como no exeder el limite
				await Promise.all(
					sym.map((s) => {
						data[s] = fetchData[s];
						return redisClientCache.setEx(
							`stockHistory=${s}`,
							60 * 12,
							JSON.stringify(fetchData[s])
						);
					})
				);
			}
		}
		const resArr: {
			symbol: string;
			date: number;
			price: number;
		}[] = [];
		stocksDate.forEach((obj) => {
			const priceIndex = (data[obj.symbol].timestamp as number[]).findIndex((ele) => {
				const eleDate = new Date(ele * 1000);
				const objDate = new Date(obj.date);
				return (
					eleDate.getDate() === objDate.getDate() &&
					eleDate.getMonth() === objDate.getMonth() &&
					eleDate.getFullYear() === eleDate.getFullYear()
				);
			});
			resArr.push({
				symbol: obj.symbol,
				date: obj.date,
				price: data[obj.symbol].close[priceIndex]
			});
		});
		return resArr;
	} catch (err) {
		console.log(err);
	}
}
