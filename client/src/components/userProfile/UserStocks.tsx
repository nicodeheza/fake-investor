import {useEffect, useState} from "react";
import {API_URL} from "../../consts";
import {useNavigate} from "react-router-dom";
import {UseUserName} from "../../context/UserContext";

interface data {
	fullName: string;
	symbol: string;
	price: number;
	change: number;
	quaNum: number;
	quaMon: number;
}

export default function UserStocks() {
	const {setUserName} = UseUserName();
	const [stocksData, setStockData] = useState<data>();
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`${API_URL}/user/stocks`, {
			method: "GET",
			credentials: "include"
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				if (data.userName === "") {
					setUserName("");
					navigate("/");
				}
				setStockData(data);
			})
			.catch((err) => console.log(err));
	}, [navigate, setUserName]);

	return (
		<div>
			<div>
				<h2>My Stocks</h2>
				<input type="text" />
			</div>
			{stocksData
				? {
						/**/
				  }
				: null}
		</div>
	);
}
