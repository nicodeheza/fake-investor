interface sData {
	[key: string]: {[key: string]: string};
}
export interface data {
	daily: sData;
	weekly: sData;
	monthly: sData;
}

export interface resData {
	lastPrice: number;
	dailyVariationMon: number;
	dailyVariationPer: number;
	monthlyVariationMon: number;
	monthlyVariationPer: number;
	last12Mon: number | null;
	last12Per: number | null;
	volume: number;
	avgVolume: number;
	userProp: boolean;
}

export default function SortStockData(data: data): resData {
	const dailyKeys = Object.keys(data.daily);
	const monthlyKeys = Object.keys(data.monthly);

	const lastPrice: number = parseFloat(data["daily"][dailyKeys[0]]["4. close"]);
	const dailyVariationMon: number =
		lastPrice - parseFloat(data["daily"][dailyKeys[1]]["4. close"]);
	const dailyVariationPer: number = (dailyVariationMon * 100) / lastPrice;
	const monthlyVariationMon: number =
		parseFloat(data["monthly"][monthlyKeys[0]]["4. close"]) -
		parseFloat(data["monthly"][monthlyKeys[1]]["4. close"]);
	const monthlyVariationPer: number =
		(monthlyVariationMon * 100) / parseFloat(data["monthly"][monthlyKeys[0]]["4. close"]);
	const last12Mon: number | null = data["monthly"][monthlyKeys[11]]["4. close"]
		? parseFloat(data["monthly"][monthlyKeys[0]]["4. close"]) -
		  parseFloat(data["monthly"][monthlyKeys[11]]["4. close"])
		: null;
	const last12Per: number | null = last12Mon
		? (last12Mon * 100) / parseFloat(data["monthly"][monthlyKeys[0]]["4. close"])
		: null;
	const volume: number = parseFloat(data["monthly"][monthlyKeys[0]]["5. volume"]);
	const avgVolume: number =
		(parseFloat(data["monthly"][monthlyKeys[0]]["5. volume"]) +
			parseFloat(data["monthly"][monthlyKeys[1]]["5. volume"]) +
			parseFloat(data["monthly"][monthlyKeys[2]]["5. volume"])) /
		3;

	//todo
	const userProp: boolean = false;

	return {
		lastPrice,
		dailyVariationMon,
		dailyVariationPer,
		monthlyVariationMon,
		monthlyVariationPer,
		last12Mon,
		last12Per,
		volume,
		avgVolume,
		userProp
	};
}
