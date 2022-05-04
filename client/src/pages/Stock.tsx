import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {API_URL} from "../consts";
import Arrow from "../svg/Arrow";
import Chart from "../components/stock/Chart";
import roundTow from "../helpers/roundTow";
import "./stock.css";
import {UseUserName} from "../context/UserContext";
import Btn from "../components/Btn";
import BuyCard, {buyCard} from "../components/stock/BuyCard";
import SellCard from "../components/stock/SellCard";

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
	const [showSell, setShowSell] = useState(false);
	const [cardProps, setCardsProps] = useState<buyCard | undefined>();
	const {userName, setUserName} = UseUserName();
	const navigate = useNavigate();

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
	}, [params]);

	function getCardProps(buy: boolean) {
		fetch(`${API_URL}/stock/buy-card`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((d) => {
				console.log(d);
				if (d.userName === "") {
					setUserName("");
					navigate("/");
				}
				if (buy) {
					setCardsProps({
						name: `${data!.longName} (${params.symbol})`,
						price: data!.regularMarketPrice,
						moneyAvailable: d.fud,
						portfolio: d.portfolioV,
						currentHolding: data!.userProp as number,
						setShow: setShowBuy
					});
					setShowBuy(true);
				} else {
					setCardsProps({
						name: `${data!.longName} (${params.symbol})`,
						price: data!.regularMarketPrice,
						moneyAvailable: d.fud,
						portfolio: d.portfolioV,
						currentHolding: data!.userProp as number,
						setShow: setShowSell
					});
					setShowSell(true);
				}
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
							<Btn text="Buy" padding="10px 40px" onClick={() => getCardProps(true)} />
						) : null}
						{userName && data.userProp ? (
							<Btn
								text="Sell"
								padding="10px 40px"
								color="var(--red)"
								onClick={() => getCardProps(false)}
							/>
						) : null}
					</div>
					{showBuy ? (
						<BuyCard
							name={cardProps!.name}
							price={cardProps!.price}
							moneyAvailable={cardProps!.moneyAvailable}
							portfolio={cardProps!.portfolio}
							currentHolding={cardProps!.currentHolding}
							setShow={cardProps!.setShow}
						/>
					) : null}
					{showSell ? (
						<SellCard
							name={cardProps!.name}
							price={cardProps!.price}
							portfolio={cardProps!.portfolio}
							currentHolding={cardProps!.currentHolding}
							setShow={cardProps!.setShow}
						/>
					) : null}
				</div>
			) : (
				<div className="stock-main-container">
					<h1>
						<div className="loading-div" />
					</h1>
					<div className="stock-main-bar">
						<div className="stock-main-bar-price">
							<h3>
								<div className="loading-div" />
							</h3>
							<p>Price</p>
						</div>
						<div className="stock-main-bar-daily">
							<h3>
								<div className="loading-div" />
							</h3>
							<p>Change</p>
						</div>
					</div>
					<div className="stock-b">
						<div className="stock-b-data">
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Previous Close</p>
								<p className="stock-b-data-item-r">
									<div className="loading-div" />
								</p>
							</div>
							<div className="stock-b-data-item">
								<p className="stock-b-data-item-l">Open</p>
								<p>
									<div className="loading-div" />
								</p>
							</div>
							<div className="stock-b-data-item">
								<p>Day's Range</p>
								<p>
									<div className="loading-div" />
								</p>
							</div>
							<div className="stock-b-data-item">
								<p>52 Week Range</p>
								<p>
									<div className="loading-div" />
								</p>
							</div>
							<div className="stock-b-data-item">
								<p>Volume</p>
								<p>
									<div className="loading-div" />
								</p>
							</div>
							<div className="stock-b-data-item">
								<p>Avg. Volume</p>
								<p>
									<div className="loading-div" />
								</p>
							</div>
						</div>
						<div className="stock-b-chart-container">
							<Chart symbol={params.symbol} />
						</div>
					</div>
					<div className="stock-b-btn-container"></div>
				</div>
			)}
		</>
	);
}
