import {useEffect, useState} from "react";
import Btn from "../Btn";
import "./buyCard.css";
import roundTow from "../../helpers/roundTow";
import {API_URL} from "../../consts";
import {useNavigate} from "react-router-dom";
import {UseUserName} from "../../context/UserContext";

interface sellCard {
	name: string;
	price: number;
	portfolio: number;
	currentHolding: number;
	setShow: (value: React.SetStateAction<boolean>) => void;
}

interface res {
	holdingQua: number;
	holdingPer: number;
	mony: number;
}

export default function SellCard({
	name,
	price,
	portfolio,
	currentHolding,
	setShow
}: sellCard) {
	const [sellAmount, setSellAmount] = useState(0);
	const [inputDisplay, setInputDisplay] = useState("0");
	const [showData, setShowData] = useState<res>();
	const [message, setMessage] = useState("");
	const navigate = useNavigate();
	const {setUserName} = UseUserName();

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		let sVal = e.target.value;
		if (sVal === "") sVal = "0";
		const val = parseInt(sVal);
		setSellAmount(val > currentHolding ? Math.floor(currentHolding) : val);
	}

	useEffect(() => {
		setInputDisplay(sellAmount.toString());
	}, [sellAmount]);

	useEffect(() => {
		const amo = isNaN(sellAmount) ? 0 : sellAmount;
		const holdingQua = roundTow(currentHolding - amo);
		const holdingPer = roundTow((holdingQua * price * 100) / portfolio);
		const mony = roundTow(amo * price);
		setShowData({
			holdingQua,
			holdingPer,
			mony
		});
	}, [sellAmount, currentHolding, price, portfolio]);

	function sell() {
		setMessage("");
		if (sellAmount > 0) {
			const matchArr = name.match(/\(([a-zA-Z]+)\)/);
			const symbol = matchArr![1];
			const fullName = name.split("(")[0].trim();

			fetch(`${API_URL}/stock/sell`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify({
					symbol,
					name: fullName,
					amount: sellAmount,
					price
				})
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.message === "ok") {
						navigate("/portfolio");
					} else if (data.userName === "") {
						setUserName("");
						navigate("/");
					} else {
						setMessage("Error");
					}
				})
				.catch((err) => console.log(err));
		} else {
			setMessage("The transaction amount must be greater than 0");
		}
	}

	return (
		<div className="buyCard-container">
			<div className="buyCard">
				<h2>
					{name} ({price})
				</h2>
				<ul>
					<li>
						<p>Holding Amount</p>
						<p>
							{showData?.holdingQua} ({showData?.holdingPer}%)
						</p>
					</li>
					<li className="buyCard-input-container">
						<p>Amount to Sell</p>
						<input
							type="number"
							min={0}
							value={inputDisplay}
							onChange={(e) => change(e)}
						/>
					</li>
					<li>
						<p>Earned Mony</p>
						<p className="buyCard-total">{showData?.mony} FUD</p>
					</li>
				</ul>
				<div className="buyCard-btn-container">
					<Btn text="Sell" padding="10px 30px" onClick={() => sell()} />
					<Btn
						text="Cancel"
						padding="10px 30px"
						color="var(--red)"
						onClick={() => setShow(false)}
					/>
				</div>
				{message ? <p className="error-message">{message}</p> : null}
			</div>
		</div>
	);
}
