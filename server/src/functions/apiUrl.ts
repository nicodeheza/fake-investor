export default function apiUrl(apiFunction: string, symbol: string): string {
	const params = new URLSearchParams();
	params.append("function", apiFunction);
	params.append("symbol", symbol);
	params.append("apikey", process.env.STOCK_API_KEY || "");

	return `https://www.alphavantage.co/query?${params.toString()}`;
}
