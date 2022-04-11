import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import UserStats, {stat} from "../components/userProfile/UserStats";
import {API_URL} from "../consts";
import {UseUserName} from "../context/UserContext";
import Btn from "../components/Btn";
import "./portfolio.css";

export default function Portfolio() {
	const {userName, setUserName} = UseUserName();
	const [stats, setStats] = useState<stat>();
	const navigate = useNavigate();

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
						<UserStats
							gainMony={stats.gainMony}
							gainPer={stats.gainPer}
							liquidMon={stats.liquidMon}
							liquidPer={stats.liquidPer}
							stocksMon={stats.stocksMon}
							stocksPer={stats.stocksPer}
							total={stats.total}
						/>
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
