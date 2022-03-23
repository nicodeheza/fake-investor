import {useState} from "react";
import {Link} from "react-router-dom";
import {API_URL} from "../consts";
import "./search.css";

type td = {
	[key: string]: {
		name: string;
		price: number;
		variation: string;
	};
};

const fillData: td = {
	1: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	2: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	3: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	4: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	5: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	6: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	7: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	8: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "-0.35%"
	},
	9: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	},
	10: {
		name: "Lorem Ipsum(LOR)",
		price: 124.2,
		variation: "+0.35%"
	}
};

const emptyData: td = {
	1: {
		name: "",
		price: 0,
		variation: ""
	},
	2: {
		name: "",
		price: 0,
		variation: ""
	},
	3: {
		name: "",
		price: 0,
		variation: ""
	},
	4: {
		name: "",
		price: 0,
		variation: ""
	},
	5: {
		name: "",
		price: 0,
		variation: ""
	},
	6: {
		name: "",
		price: 0,
		variation: ""
	},
	7: {
		name: "",
		price: 0,
		variation: ""
	},
	8: {
		name: "",
		price: 0,
		variation: ""
	},
	9: {
		name: "",
		price: 0,
		variation: ""
	},
	10: {
		name: "",
		price: 0,
		variation: ""
	}
};
type searchRes = {[key: string]: string}[];

export default function Search() {
	const [topData, setTopData] = useState(fillData);
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
					fetch(`${API_URL}/stock/search/${query}`)
						.then((res) => res.json())
						.then((data) => {
							console.log(data);
							if (!data.ResultSet.Result) {
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
	//change p for link and make link work

	return (
		<div className="searchContainer">
			<div className="searchContent">
				<h1>
					<img
						src="./assets/sparck.svg"
						alt="sparck img"
						className="searchContent-sparck"
					/>
					Stoks <span>Searcher</span>
				</h1>
				<input
					type="search"
					placeholder="Search..."
					onChange={(e) => searchStock(e.target.value)}
				/>
				{searchResult?.length > 0 && !typing ? (
					<ul className="search-result-box">
						{searchResult.map((res, i) => (
							<li className="search-result-box-link" key={i}>
								<Link to={`/stock/${res.symbol}/${res.name}`}>
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
					<h2>Top 10 Stocks</h2>
					<table>
						<tbody>
							<tr>
								<th>Ranking</th>
								<th>Name</th>
								<th>Price</th>
								<th>Daily Variation</th>
							</tr>
							{Object.keys(topData).map((k, i) => (
								<tr key={i}>
									<td>{k}</td>
									{topData[k].name ? (
										<>
											<td>{topData[k].name}</td>
											<td>{topData[k].price}</td>
											<td
												className={
													new RegExp("[+]").test(topData[k].variation) ? "green" : "red"
												}
											>
												{topData[k].variation}
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
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
