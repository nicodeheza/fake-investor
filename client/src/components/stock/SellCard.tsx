import {useEffect, useState} from "react";
import Btn from "../Btn";
import "./buyCard.css";
import roundTow from "../../helpers/roundTow";

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
	const [showData, setShowData] = useState<res>();

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
							value={sellAmount}
							onChange={(e) =>
								setSellAmount(
									parseInt(e.target.value) > currentHolding
										? Math.floor(currentHolding)
										: parseInt(e.target.value)
								)
							}
						/>
					</li>
					<li>
						<p>Earned Mony</p>
						<p className="buyCard-total">{showData?.mony} FUD</p>
					</li>
				</ul>
				<div className="buyCard-btn-container">
					<Btn text="Sell" padding="10px 30px" />
					<Btn
						text="Cancel"
						padding="10px 30px"
						color="var(--red)"
						onClick={() => setShow(false)}
					/>
				</div>
			</div>
		</div>
	);
}
