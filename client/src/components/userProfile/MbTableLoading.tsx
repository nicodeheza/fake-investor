import "./mbTable.css";

export default function MbTableLoading() {
	return (
		<div className="mdTable">
			<table>
				<tbody>
					<tr>
						<th>Name</th>
						<td>
							<div className="loading-div" />
						</td>
					</tr>
					<tr>
						<th>Price</th>
						<td>
							<div className="loading-div" />
						</td>
					</tr>
					<tr>
						<th>Change</th>
						<td>
							<div className="loading-div" />
						</td>
					</tr>
					<tr>
						<th>Quantity</th>
						<td>
							<div className="loading-div" />
						</td>
					</tr>
					<tr>
						<th></th>
						<td>
							<div className="loading-div" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
