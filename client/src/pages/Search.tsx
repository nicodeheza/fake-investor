import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Spinner from "../components/Spinner";
import {API_URL} from "../consts";
import roundTow from "../helpers/roundTow";
import "./search.css";

type td = {
	[key: string]: {
		name: string;
		symbol: string;
		price: number;
		variation: number;
	};
};
const emptyData: td = {};
for (let i = 1; i <= 10; i++) {
	emptyData[i] = {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	};
}
type searchRes = {[key: string]: string}[];

export default function Search() {
	const [topData, setTopData] = useState(emptyData);
	const [timeOut, setTimeOut] = useState<null | ReturnType<typeof setTimeout>>(null);
	const [searchResult, setSearchResult] = useState<searchRes | []>([]);
	const [typing, setTyping] = useState(false);
	const navigate = useNavigate();

	function searchStock(query: string) {
		setSearchResult([]);
		if (!query) {
			setTyping(false);
		} else {
			setTyping(true);
		}
		if (timeOut) {
			clearTimeout(timeOut);
		}

		setTimeOut(
			setTimeout(() => {
				if (query) {
					fetch(`${API_URL}/stock/search/${query}`, {
						method: "GET",
						credentials: "include"
					})
						.then((res) => res.json())
						.then((data) => {
							if (data.message === "Limit Exceeded") {
								navigate("/error");
							} else {
								setSearchResult(data.ResultSet.Result);
							}
							setTyping(false);
						})
						.catch((err) => console.log(err));
				}
			}, 1000)
		);
	}

	//get stock top
	useEffect(() => {
		fetch(`${API_URL}/stock/top`)
			.then((res) => res.json())
			.then((data) => {
				if (data.message === "Limit Exceeded") navigate("/error");
				setTopData(data);
			})
			.catch((err) => console.log(err));
	}, [navigate]);

	return (
		<div className="searchContainer">
			<div className="searchContent">
				<header>
					<img
						src="./assets/sparck.svg"
						alt="sparck img"
						className="searchContent-sparck"
					/>
					<h1>
						Stoks <span>Searcher</span>
					</h1>
				</header>
				<input
					type="search"
					placeholder="Search..."
					onChange={(e) => searchStock(e.target.value)}
				/>
				{searchResult?.length > 0 && !typing ? (
					<ul className="search-result-box">
						{searchResult.map((res, i) => (
							<li className="search-result-box-link" key={i}>
								<Link to={`/stock/${res.symbol}`}>
									{res.name} ( {res.symbol} )
								</Link>
							</li>
						))}
					</ul>
				) : typing && searchResult?.length === 0 ? (
					<div className="search-result-box-loading">
						<div className="search-result-box-loading-spinner">
							<Spinner />
						</div>
					</div>
				) : (
					<></>
				)}
				<div className="searchTopContainer">
					<h2>Top 10 Popular Stocks</h2>
					<table>
						<tbody>
							<tr>
								<th>Ranking</th>
								<th className="top-name-title">Name</th>
								<th>Price</th>
								<th>Daily Variation</th>
							</tr>
							{Object.keys(topData).map((k, i) => (
								<tr key={i}>
									<td>{k}</td>
									{topData[k].name ? (
										<>
											<td className="top-name">
												<Link to={`/stock/${topData[k].symbol}`}>{topData[k].name}</Link>
											</td>
											<td>{topData[k].price}</td>
											<td className={topData[k].variation >= 0 ? "green" : "red"}>
												{topData[k].variation >= 0 ? "+" : null}
												{roundTow(topData[k].variation)}%
											</td>
										</>
									) : (
										<>
											<td className="loading-td">
												<div className="loading-div" />
											</td>
											<td className="loading-td">
												<div className="loading-div" />
											</td>
											<td className="loading-td">
												<div className="loading-div" />
											</td>
										</>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
