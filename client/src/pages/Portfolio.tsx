import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Btn from "../components/Btn";
import {API_URL} from "../consts";
import {UseUserName} from "../context/UserContext";
import roundTow from "../helpers/roundTow";
import Arrow from "../svg/Arrow";
import "./portfolio.css";

interface stat {
	gainMony: number;
	gainPer: number;
	liquidMon: number;
	liquidPer: number;
	stocksMon: number;
	stocksPer: number;
	total: number;
}

export default function Portfolio() {
	const [stats, setStats] = useState<stat>();
	const {userName, setUserName} = UseUserName();
	const navigate = useNavigate();

	//getStats
	useEffect(() => {
		fetch(`${API_URL}/user/userStats`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				if (data.userName === "") {
					setUserName("");
					navigate("/");
				}
				setStats(data);
			})
			.catch((err) => console.log(err));
	}, [navigate, setUserName]);
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
						<table>
							<tbody>
								<tr>
									<td className="portfolio-stats-col1">Gains</td>
									<td
										className={`portfolio-stats-col2 ${
											stats.gainMony > 0 ? "green" : "red"
										}`}
									>
										<div className="portfolio-stats-arrow">
											<Arrow pos={stats!.gainMony > 0 ? "up" : "down"} />
										</div>
										{roundTow(stats.gainPer)}%
									</td>
									<td className="portfolio-stats-col3">{roundTow(stats.gainMony)} FUD</td>
								</tr>
								<tr>
									<td className="portfolio-stats-col1">Liquid</td>
									<td className="portfolio-stats-col2">{roundTow(stats.liquidPer)}%</td>
									<td className="portfolio-stats-col3">
										{roundTow(stats.liquidMon)} FUD
									</td>
								</tr>
								<tr>
									<td className="portfolio-stats-col1">Stocks</td>
									<td className="portfolio-stats-col2">{roundTow(stats.stocksPer)}%</td>
									<td className="portfolio-stats-col3">
										{roundTow(stats.stocksMon)} FUD
									</td>
								</tr>
								<tr>
									<td className="portfolio-stats-col1">Total</td>
									<td className="portfolio-stats-col2">{roundTow(stats.total)} FUD</td>
									<td></td>
								</tr>
							</tbody>
						</table>
					) : null}
					<div className="portfolio-stats-btn-container">
						<Btn
							text="Stock Trading"
							padding="10px 20px"
							onClick={() => navigate("/search")}
						/>
					</div>
				</div>
				<div className="portfolio-chart"></div>
			</div>
		</div>
	);
}
