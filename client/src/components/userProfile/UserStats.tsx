import Arrow from "../../svg/Arrow";
import roundTow from "../../helpers/roundTow";

import "./userStats.css";

export interface stat {
	gainMony: number;
	gainPer: number;
	liquidMon: number;
	liquidPer: number;
	stocksMon: number;
	stocksPer: number;
	total: number;
}

export default function UserStats({
	gainMony,
	gainPer,
	liquidMon,
	liquidPer,
	stocksMon,
	stocksPer,
	total
}: stat) {
	return (
		<table>
			<tbody>
				<tr>
					<td className="portfolio-stats-col1">Gains</td>
					<td className={`portfolio-stats-col2 ${gainMony > 0 ? "green" : "red"}`}>
						<div className="portfolio-stats-arrow">
							<Arrow pos={gainMony > 0 ? "up" : "down"} />
						</div>
						{roundTow(gainPer)}%
					</td>
					<td className="portfolio-stats-col3">{roundTow(gainMony)} FUD</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Liquid</td>
					<td className="portfolio-stats-col2">{roundTow(liquidPer)}%</td>
					<td className="portfolio-stats-col3">{roundTow(liquidMon)} FUD</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Stocks</td>
					<td className="portfolio-stats-col2">{roundTow(stocksPer)}%</td>
					<td className="portfolio-stats-col3">{roundTow(stocksMon)} FUD</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Total</td>
					<td className="portfolio-stats-col2">{roundTow(total)} FUD</td>
					<td></td>
				</tr>
			</tbody>
		</table>
	);
}
