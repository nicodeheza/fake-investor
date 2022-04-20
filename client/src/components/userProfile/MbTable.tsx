import {TableProps} from "./DkTable";
import roundTow from "../../helpers/roundTow";
import Btn from "../Btn";
import {useNavigate} from "react-router-dom";
import "./mbTable.css";

export default function MbTable({stocks, portfolioTotal}: TableProps) {
	const navigate = useNavigate();

	function getPerQua(quaMon: number) {
		return roundTow((quaMon * 100) / portfolioTotal);
	}

	return (
		<div className="mdTable">
			{stocks.map((stock, i) => {
				if (stock.symbol !== "FUD") {
					return (
						<table key={i}>
							<tbody>
								<tr>
									<th>Name</th>
									<td>
										{stock.fullName}({stock.symbol})
									</td>
								</tr>
								<tr>
									<th>Price</th>
									<td>{roundTow(stock.price)}</td>
								</tr>
								<tr>
									<th>Change</th>
									<td className={stock.change > 0 ? "green" : "red"}>
										{stock.change > 0 ? "+" : "-"}
										{roundTow(stock.change)}%
									</td>
								</tr>
								<tr>
									<th>Quantity</th>
									<td>
										{stock.quaNum} • {getPerQua(stock.quaMon)}% • {roundTow(stock.quaMon)}
										FUD
									</td>
								</tr>
								<tr>
									<th></th>
									<td>
										<Btn
											text="Trade"
											color="var(--green)"
											padding="5px 30px"
											onClick={() => navigate(`/stock/${stock.symbol}`)}
										/>
									</td>
								</tr>
							</tbody>
						</table>
					);
				} else {
					return null;
				}
			})}
		</div>
	);
}
