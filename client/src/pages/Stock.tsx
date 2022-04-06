import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {API_URL} from "../consts";
import Arrow from "../svg/Arrow";
import Chart from "../components/stock/Chart";
import roundTow from "../helpers/roundTow";
import "./stock.css";
import {UseUserName} from "../context/UserContext";
import Btn from "../components/Btn";
import BuyCard, {buyCard} from "../components/stock/BuyCard";

type data = {
	longName: string;
	regularMarketPrice: number;
	regularMarketChange: number;
	regularMarketChangePercent: number;
	regularMarketPreviousClose: number;
	regularMarketOpen: number;
	regularMarketDayRange: string;
	fiftyTwoWeekRange: string;
	regularMarketVolume: number;
	averageDailyVolume3Month: number;
	userProp: number | boolean;
};

export default function Stock() {
	const params = useParams();
	const [data, setData] = useState<data | undefined>();
	const [showBuy, setShowBuy] = useState(false);
	const [buyProps, setBuyProps] = useState<buyCard | undefined>();
	const {userName} = UseUserName();

	useEffect(() => {
		console.log(params.symbol);
		fetch(`${API_URL}/stock/${params.symbol}`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				setData(data);
			})
			.catch((err) => console.log(err));
		// setData(m);

		fetch(`${API_URL}/stock/buy-card`, {
			method: "GET",
			credentials: "include"
		});
	}, [params]);

	function getBuyProps() {
		fetch(`${API_URL}/stock/buy-card`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((d) => {
				console.log(d);
				setBuyProps({
					name: `${data!.longName} (${params.symbol})`,
					price: data!.regularMarketPrice,
					moneyAvailable: d.fud,
					portfolio: d.portfolioV,
					currentHolding: data!.userProp as number,
					setShowBuy
				});
				setShowBuy(true);
			})
			.catch((err) => console.log(err));
	}

	return (
		<>
			{data ? (
				<div className="stock-main-container">
					<h1>
						{data.longName} ({params.symbol})
					</h1>
					<div className="stock-main-bar">
						<div className="stock-main-bar-price">
							<h3>{data?.regularMarketPrice}</h3>
							<p>Price</p>
						</div>
						<div className="stock-main-bar-daily">
							<h3
								style={
									data.regularMarketChange >= 0
										? {color: "var(--green)"}
										: {color: "var(--red)"}
								}
							>
								<samp className="stock-main-bar-daily-arrow">
									<Arrow pos={data.regularMarketChange >= 0 ? "up" : "down"} />
								</samp>
								{data.regularMarketChange >= 0
									? `+${roundTow(data.regularMarketChange)}/+${roundTow(
											data.regularMarketChangePercent
									  )}%`
									: `${roundTow(data.regularMarketChange)}/${roundTow(
											data.regularMarketChangePercent
									  )}%`}
							</h3>
							<p>Change</p>
						</div>
					</div>
					<div className="stock-b">
						<div className="stock-b-data">
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Previous Close</p>
								<p className="stock-b-data-item-r">{data.regularMarketPreviousClose}</p>
							</div>
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Open</p>
								<p>{data.regularMarketOpen}</p>
							</div>
							<div className="stock-b-data-item">
								<p>Day's Range</p>
								<p>{data.regularMarketDayRange}</p>
							</div>
							<div className="stock-b-data-item">
								<p>52 Week Range</p>
								<p>{data.fiftyTwoWeekRange}</p>
							</div>
							<div className="stock-b-data-item">
								<p>Volume</p>
								<p>{data.regularMarketVolume}</p>
							</div>
							<div className="stock-b-data-item">
								<p>Avg. Volume</p>
								<p>{data.averageDailyVolume3Month}</p>
							</div>
						</div>
						<div className="stock-b-chart-container">
							<Chart symbol={params.symbol} />
						</div>
					</div>
					<div className="stock-b-btn-container">
						{userName ? (
							<Btn text="Buy" padding="10px 40px" onClick={() => getBuyProps()} />
						) : null}
					</div>
					{showBuy ? (
						<BuyCard
							name={buyProps!.name}
							price={buyProps!.price}
							moneyAvailable={buyProps!.moneyAvailable}
							portfolio={buyProps!.portfolio}
							currentHolding={buyProps!.currentHolding}
							setShowBuy={buyProps!.setShowBuy}
						/>
					) : null}
				</div>
			) : (
				<div></div>
			)}
		</>
	);
}
