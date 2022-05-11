interface quote {
	symbol: string;
	regularMarketPrice: number;
	regularMarketChangePercent: number;
}

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
