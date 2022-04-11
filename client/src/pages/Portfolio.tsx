import UserStats from "../components/userProfile/UserStats";
import {UseUserName} from "../context/UserContext";

import "./portfolio.css";

export default function Portfolio() {
	const {userName} = UseUserName();

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
				<UserStats />
				<div className="portfolio-chart"></div>
			</div>
		</div>
	);
}
