import "./dkTable.css";

export default function DkTableLoading() {
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
				<tr>
					<td className="dkTable-name-col">
						<div>
							<div className="loading-div" />
						</div>
					</td>
					<td>
						<div className="loading-div" />
					</td>
					<td>
						<div className="loading-div" />
					</td>
					<td>
						<div className="loading-div" />
					</td>
					<td>
						<div className="loading-div" />
					</td>
				</tr>
			</tbody>
		</table>
	);
}
