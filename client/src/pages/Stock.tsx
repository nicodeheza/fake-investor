import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {API_URL} from "../consts";
import Arrow from "../svg/Arrow";
import Chart from "../components/stock/Chart";
import "./stock.css";
import SortStockData from "../functions/SortStockData";

type data = {
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
};

export default function Stock() {
	const params = useParams();
	const [data, setData] = useState<data | undefined>();

	useEffect(() => {
		console.log(params.symbol);
		console.log(params.name);
		fetch(`${API_URL}/stock/${params.symbol}`)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				setData(SortStockData(data));
			})
			.catch((err) => console.log(err));
	}, [params]);

	function roundFloat(n: number) {
		return Math.round((n + Number.EPSILON) * 100) / 100;
	}
	return (
		<>
			{data ? (
				<div className="stock-main-container">
					<h1>
						{params.name} ({params.symbol})
					</h1>
					<div className="stock-main-bar">
						<div className="stock-main-bar-price">
							<h3>{data?.lastPrice}</h3>
							<p>Price</p>
						</div>
						<div className="stock-main-bar-daily">
							<h3
								style={
									data.dailyVariationMon >= 0
										? {color: "var(--green)"}
										: {color: "var(--red)"}
								}
							>
								<samp className="stock-main-bar-daily-arrow">
									<Arrow pos={data.dailyVariationMon >= 0 ? "up" : "down"} />
								</samp>
								{data.dailyVariationMon >= 0
									? `+${roundFloat(data.dailyVariationMon)}/+${roundFloat(
											data.dailyVariationPer
									  )}%`
									: `${roundFloat(data.dailyVariationMon)}/${roundFloat(
											data.dailyVariationPer
									  )}%`}
							</h3>
							<p>Daily Variation</p>
						</div>
					</div>
					<div className="stock-b">
						<div className="stock-b-data">
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Monthly Variation</p>
								<p
									className="stock-b-data-item-r"
									style={
										data.monthlyVariationMon >= 0
											? {color: "var(--green)"}
											: {color: "var(--red)"}
									}
								>
									<span>
										<Arrow pos={data.monthlyVariationMon >= 0 ? "up" : "down"} />
									</span>
									{data.monthlyVariationMon >= 0
										? `+${roundFloat(data.monthlyVariationMon)}/+${roundFloat(
												data.monthlyVariationPer
										  )}%`
										: `${roundFloat(data.monthlyVariationMon)}/${roundFloat(
												data.monthlyVariationPer
										  )}%`}
								</p>
							</div>
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Last 12 month variation</p>
								{data.last12Mon && data.last12Per ? (
									<p
										className="stock-b-data-item-r"
										style={
											data.last12Mon >= 0
												? {color: "var(--green)"}
												: {color: "var(--red)"}
										}
									>
										{!data.last12Mon ? null : (
											<span>
												<Arrow pos={data.last12Mon >= 0 ? "up" : "down"} />
											</span>
										)}
										{data.last12Mon >= 0
											? `+${roundFloat(data.last12Mon)}/+${roundFloat(data.last12Per)}%`
											: `${roundFloat(data.last12Mon)}/${roundFloat(data.last12Per)}%`}
									</p>
								) : (
									<p>NaN</p>
								)}
							</div>
							<div className="stock-b-data-item">
								<p>Volume</p>
								<p>{data.volume}</p>
							</div>
							<div className="stock-b-data-item">
								<p>Avg.volume(3m)</p>
								<p>{roundFloat(data.avgVolume)}</p>
							</div>
						</div>
						<div className="stock-b-chart-container">
							<Chart />
						</div>
					</div>
				</div>
			) : (
				<div></div>
			)}
		</>
	);
}
