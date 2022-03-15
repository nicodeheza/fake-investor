import {useState} from "react";
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

export default function Search() {
	const [topData, setTopData] = useState(emptyData);

	return (
		<div className="searchContainer">
			<div className="searchContent">
				<h1>
					Stoks <span>Searcher</span>
				</h1>
				<input type="text" placeholder="Search..." />
				<div className="searchTopContainer">
					<h2>Top 10 Stocks</h2>
					<table>
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
					</table>
				</div>
			</div>
		</div>
	);
}
