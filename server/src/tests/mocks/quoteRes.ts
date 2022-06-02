export interface quote {
	symbol: string;
	regularMarketPrice: number;
	regularMarketChangePercent: number;
}

export const QUOTE_RES_STATIC = {
	quoteResponse: {
		error: null,
		result: [
			{
				symbol: "IBM",
				regularMarketPrice: 100,
				regularMarketChangePercent: 1
			},
			{
				symbol: "AAPL",
				regularMarketPrice: 200,
				regularMarketChangePercent: 2
			},
			{
				symbol: "GOOG",
				regularMarketPrice: 300,
				regularMarketChangePercent: 3
			}
		]
	}
};

export default function quoteRes(symbols: string[]) {
	const res: {
		quoteResponse: {
			error: null;
			result: quote[];
		};
	} = {
		quoteResponse: {
			error: null,
			result: []
		}
	};

	symbols.forEach((ele) => {
		res.quoteResponse.result.push({
			symbol: ele,
			regularMarketPrice: Math.random() * 200 + 100,
			regularMarketChangePercent: Math.random() * 50
		});
	});

	return res;
}
