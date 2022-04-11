import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {API_URL} from "../../consts";
import {UseUserName} from "../../context/UserContext";
import Btn from "../Btn";
import Arrow from "../../svg/Arrow";
import roundTow from "../../helpers/roundTow";
interface stat {
	gainMony: number;
	gainPer: number;
	liquidMon: number;
	liquidPer: number;
	stocksMon: number;
	stocksPer: number;
	total: number;
}

export default function UserStats() {
	const [stats, setStats] = useState<stat>();
	const navigate = useNavigate();
	const {setUserName} = UseUserName();

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
		<div className="portfolio-stats">
			<h2>Your Stats</h2>
			{stats ? (
				<table>
					<tbody>
						<tr>
							<td className="portfolio-stats-col1">Gains</td>
							<td
								className={`portfolio-stats-col2 ${stats.gainMony > 0 ? "green" : "red"}`}
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
							<td className="portfolio-stats-col3">{roundTow(stats.liquidMon)} FUD</td>
						</tr>
						<tr>
							<td className="portfolio-stats-col1">Stocks</td>
							<td className="portfolio-stats-col2">{roundTow(stats.stocksPer)}%</td>
							<td className="portfolio-stats-col3">{roundTow(stats.stocksMon)} FUD</td>
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
	);
}
