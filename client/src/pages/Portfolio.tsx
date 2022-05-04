import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import UserStats, {stat} from "../components/userProfile/UserStats";
import {API_URL} from "../consts";
import {UseUserName} from "../context/UserContext";
import Btn from "../components/Btn";
import DkTable, {stockData} from "../components/userProfile/DkTable";
import "./portfolio.css";
import MbTable from "../components/userProfile/MbTable";
import UserChart from "../components/userProfile/UserChart";
import Reset from "../components/userProfile/Reset";
import UserStatsLoading from "../components/userProfile/UserStatsLoading";
import DkTableLoading from "../components/userProfile/DkTableLoading";
import MbTableLoading from "../components/userProfile/MbTableLoading";

export default function Portfolio() {
	const {userName, setUserName} = UseUserName();
	const [stats, setStats] = useState<stat>();
	const [userStocks, setUserStoks] = useState<stockData[]>();
	const [filteredStoks, setFilteredStoks] = useState<stockData[]>();
	const navigate = useNavigate();

	//get Stats
	useEffect(() => {
		fetch(`${API_URL}/user/userStats`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				// console.log(data);
				if (data.userName === "") {
					setUserName("");
					navigate("/");
				}
				setStats(data);
			})
			.catch((err) => console.log(err));
	}, [navigate, setUserName]);

	//get stock data
	useEffect(() => {
		fetch(`${API_URL}/user/stocks`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				// console.log(data);
				if (data.userName === "") {
					setUserName("");
					navigate("/");
				}
				setUserStoks(data);
				setFilteredStoks(data);
			})
			.catch((err) => console.log(err));
	}, [setUserName, navigate]);

	function filterStoks(e: React.ChangeEvent<HTMLInputElement>) {
		const input: string = e.target.value.toLocaleLowerCase();
		if (userStocks) {
			setFilteredStoks(
				userStocks.filter(
					(stock) =>
						stock.symbol.toLocaleLowerCase().startsWith(input) ||
						stock.fullName.toLocaleLowerCase().startsWith(input)
				)
			);
		}
	}

	return (
		<div className="portfolio">
			<header>
				<h1>
					Hey <span className="green">{userName}</span> let's make some{" "}
					<span className="red">fake mony!</span>
				</h1>
				<img src="./assets/sparck.svg" alt="sparck" />
			</header>
			<div className="portfolio-top-container">
				<div className="portfolio-stats">
					<h2>Your Stats</h2>
					{stats ? (
						<UserStats
							gainMony={stats.gainMony}
							gainPer={stats.gainPer}
							liquidMon={stats.liquidMon}
							liquidPer={stats.liquidPer}
							stocksMon={stats.stocksMon}
							stocksPer={stats.stocksPer}
							total={stats.total}
						/>
					) : (
						<UserStatsLoading />
					)}
					<div className="portfolio-stats-btn-container">
						<Btn
							text="Stock Trading"
							padding="10px 20px"
							onClick={() => navigate("/search")}
						/>
					</div>
				</div>
				<div className="portfolio-chart">
					<UserChart />
				</div>
			</div>
			<div className="portfolio-user-stock">
				<div className="portfolio-user-stock-title-search">
					<h2>My Stocks</h2>
					<input type="search" placeholder="Search..." onChange={(e) => filterStoks(e)} />
				</div>
				<div className="portfolio-user-stock-table">
					{filteredStoks && stats ? (
						<>
							<DkTable stocks={filteredStoks} portfolioTotal={stats.total} />
							<MbTable stocks={filteredStoks} portfolioTotal={stats.total} />
						</>
					) : (
						<>
							<DkTableLoading />
							<MbTableLoading />
						</>
					)}
				</div>
			</div>
			<div className="portfolio-reset">
				<Reset />
			</div>
		</div>
	);
}
