import roundTow from "../../helpers/roundTow";
import Btn from "../Btn";
import {useNavigate} from "react-router-dom";
import "./dkTable.css";

export interface stockData {
	fullName: string;
	symbol: string;
	price: number;
	change: number;
	quaNum: number;
	quaMon: number;
}

export interface TableProps {
	stocks: stockData[];
	portfolioTotal: number;
}

export default function DkTable({stocks, portfolioTotal}: TableProps) {
	const navigate = useNavigate();

	function getPerQua(quaMon: number) {
		return roundTow((quaMon * 100) / portfolioTotal);
	}

	return (
		<table className="dkTable">
			<tbody>
				<tr>
					<th>
						<div className="dkTable-name-th">Name</div>
					</th>
					<th>
						<div className="dkTable-price-th">Price</div>
					</th>
					<th>
						<div className="dkTable-change-th">Change</div>
					</th>
					<th>
						<div className="dkTable-quantity-th">Quantity</div>
					</th>
					<th></th>
				</tr>
				{stocks.map((stock, i) => {
					if (stock.symbol !== "FUD") {
						return (
							<tr key={i}>
								<td className="dkTable-name-col">
									<div>
										{stock.fullName}({stock.symbol})
									</div>
								</td>
								<td>{roundTow(stock.price)}</td>
								<td className={stock.change > 0 ? "green" : "red"}>
									{stock.change > 0 ? "+" : "-"}
									{roundTow(stock.change)}%
								</td>
								<td>
									{stock.quaNum} • {getPerQua(stock.quaMon)}% • {roundTow(stock.quaMon)}
									FUD
								</td>
								<td>
									<Btn
										text="Trade"
										color="var(--green)"
										padding="5px 30px"
										onClick={() => navigate(`/stock/${stock.symbol}`)}
									/>
								</td>
							</tr>
						);
					} else {
						return null;
					}
				})}
			</tbody>
		</table>
	);
}
