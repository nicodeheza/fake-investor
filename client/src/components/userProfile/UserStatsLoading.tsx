import "./userStats.css";

export default function UserStatsLoading() {
	return (
		<table>
			<tbody>
				<tr>
					<td className="portfolio-stats-col1">Gains</td>
					<td className={`portfolio-stats-col2`}>
						<div className="loading-div" />
					</td>
					<td className="portfolio-stats-col3">
						<div className="loading-div" />
					</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Liquid</td>
					<td className="portfolio-stats-col2">
						<div className="loading-div" />
					</td>
					<td className="portfolio-stats-col3">
						<div className="loading-div" />
					</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Stocks</td>
					<td className="portfolio-stats-col2">
						<div className="loading-div" />
					</td>
					<td className="portfolio-stats-col3">
						<div className="loading-div" />
					</td>
				</tr>
				<tr>
					<td className="portfolio-stats-col1">Total</td>
					<td className="portfolio-stats-col2">
						<div className="loading-div" />
					</td>
					<td></td>
				</tr>
			</tbody>
		</table>
	);
}
