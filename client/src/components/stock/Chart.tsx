export default function Chart() {
	return (
		<>
			<div className="stock-b-graf"></div>
			<div className="s-input-range">
				<label htmlFor="s-range">Range:</label>
				<select name="s-range" id="s-range">
					<option value="day">day</option>
					<option value="week">week</option>
					<option value="month">month</option>
				</select>
			</div>
			<div className="s-input">
				<label htmlFor="s-from">From:</label>
				<input type="date" name="s-from" id="s-from" />
			</div>
			<div className="s-input">
				<label htmlFor="s-to">To:</label>
				<input type="date" name="s-to" id="s-to" />
			</div>
		</>
	);
}
