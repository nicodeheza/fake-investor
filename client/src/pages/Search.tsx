import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
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

const emptyData: td = {
	1: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	2: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	3: {
		symbol: "",
		name: "",
		price: 0,
		variation: 0
	},
	4: {
		symbol: "",
		name: "",
		price: 0,
		variation: 0
	},
	5: {
		symbol: "",
		name: "",
		price: 0,
		variation: 0
	},
	6: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	7: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	8: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	9: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	},
	10: {
		name: "",
		symbol: "",
		price: 0,
		variation: 0
	}
};
type searchRes = {[key: string]: string}[];

//change component loading for page loading ?

export default function Search() {
	const [topData, setTopData] = useState(emptyData);
	const [timeOut, setTimeOut] = useState<null | ReturnType<typeof setTimeout>>(null);
	const [searchResult, setSearchResult] = useState<searchRes | []>([]);
	const [typing, setTyping] = useState(false);

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
							console.log(data);
							if (!data?.ResultSet?.Result) {
								setSearchResult([{symbol: "ERROR", name: "Too many calls"}]);
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

	useEffect(() => {
		fetch(`${API_URL}/stock/top`)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				setTopData(data);
			});
	}, []);
	//change p for link and make link work

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
						<img src="assets/loader.svg" alt="loading..." />
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
									{/* <Link to={`stock/${topData[k].symbol}`}> */}
									<td>{k}</td>
									{topData[k].name ? (
										<>
											<td className="top-name">{topData[k].name}</td>
											<td>{topData[k].price}</td>
											<td className={topData[k].variation >= 0 ? "green" : "red"}>
												{topData[k].variation >= 0 ? "+" : null}
												{roundTow(topData[k].variation)}
											</td>
										</>
									) : (
										<>
											<td className="loading-td">
												<div />
											</td>
											<td className="loading-td">
												<div />
											</td>
											<td className="loading-td">
												<div />
											</td>
										</>
									)}
									{/* </Link> */}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
