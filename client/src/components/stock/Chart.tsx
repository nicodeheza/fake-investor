import {useEffect} from "react";
import {API_URL} from "../../consts";

interface chart {
	symbol: string | undefined;
}

export default function Chart({symbol}: chart) {
	useEffect(() => {
		if (symbol) {
			fetch(`${API_URL}/stock/chart/${symbol}`)
				.then((res) => res.json())
				.then((data) => {
					console.log(data);
				})
				.catch((err) => console.log(err));
		}
	}, [symbol]);

	return (
		<>
			<div className="stock-b-graf"></div>
		</>
	);
}
