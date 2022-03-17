import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {API_URL} from "../consts";
import Arrow from "../svg/Arrow";

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
				setData(data);
			})
			.catch((err) => console.log(err));
	}, [params]);

	function roundFloat(n: number) {
		return Math.round((n + Number.EPSILON) * 100) / 100;
	}
	return (
		<>
			{data ? (
				<div>
					<h1>
						{params.name} ({params.symbol})
					</h1>
					<div className="stock-main-bar">
						<div className="stock-main-bar-price">
							<h3>{data?.lastPrice}</h3>
							<p>Price</p>
						</div>
						<div className="stock-main-bar-daily">
							<h3>
								<div>
									<Arrow pos={data.dailyVariationMon >= 0 ? "up" : "down"} />
								</div>
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
						<div className="stock-b">
							<div className="stock-b-data">
								<div className="stock-b-data-item">
									<p>Monthly Variation</p>
									<p>
										<div>
											<Arrow pos={data.monthlyVariationMon >= 0 ? "up" : "down"} />
										</div>
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
									<p>Last 12 month variation</p>
									<p>
										{!data.last12Mon ? null : (
											<div>
												<Arrow pos={data.last12Mon >= 0 ? "up" : "down"} />
											</div>
										)}
										{!data.last12Mon || !data.last12Per
											? "NaN"
											: data.last12Mon >= 0
											? `+${roundFloat(data.last12Mon)}/+${roundFloat(data.last12Per)}%`
											: `${roundFloat(data.last12Mon)}/${roundFloat(data.last12Per)}%`}
									</p>
								</div>
								<div className="stock-b-data-item">
									<p>Volume</p>
									<p>{data.volume}</p>
								</div>
								<div className="stock-b-data-item">
									<p>Avg.volume(3m)</p>
									<p>{data.avgVolume}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div></div>
			)}
		</>
	);
}
