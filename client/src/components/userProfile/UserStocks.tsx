import {useEffect} from "react";
import {API_URL} from "../../consts";

export default function UserStocks() {
	useEffect(() => {
		fetch(`${API_URL}/user/stocks`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				//do something
			})
			.catch((err) => console.log(err));
	}, []);
	return (
		<div>
			<div>
				<h2>My Stocks</h2>
				<input type="text" />
			</div>
		</div>
	);
}
