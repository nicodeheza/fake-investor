import {useEffect, useState} from "react";
import roundTow from "../../helpers/roundTow";
import Btn from "../Btn";
import "./buyCard.css";

export interface buyCard {
	name: string;
	price: number;
	moneyAvailable: number;
	portfolio: number;
	currentHolding: number;
	setShowBuy: (value: React.SetStateAction<boolean>) => void;
}

interface res {
	amountPer: number;
	currentPer: number;
	totalQua: number;
	totalPer: number;
	debit: number;
}

export default function BuyCard({
	name,
	price,
	moneyAvailable,
	portfolio,
	currentHolding,
	setShowBuy
}: buyCard) {
	const [amount, setAmount] = useState(0);
	const [results, setResults] = useState<res>();

	useEffect(() => {
		// if (amount > moneyAvailable / price) setAmount(Math.floor(moneyAvailable / price));
		const amo = isNaN(amount) ? 0 : amount;
		setResults({
			amountPer: roundTow((amo * price * 100) / portfolio),
			currentPer: roundTow((currentHolding * price * 100) / portfolio),
			totalQua: currentHolding + amo,
			totalPer: roundTow(((currentHolding + amo) * price * 100) / portfolio),
			debit: roundTow(amo * price)
		});
	}, [amount, currentHolding, portfolio, price]);

	return (
		<div className="buyCard-container">
			<div className="buyCard">
				<h2>
					<span>{name}</span>
					<span>{price}</span>
				</h2>
				<ul>
					<li>
						<p>Money Available</p>
						<p>{moneyAvailable}FUD</p>
					</li>
					<li>
						<p>Amount</p>
						<div className="buyCard-input-container">
							<input
								type="number"
								min={0}
								value={amount}
								onChange={(e) =>
									setAmount((p) =>
										parseInt(e.target.value) < moneyAvailable / price ||
										e.target.value === ""
											? parseInt(e.target.value)
											: p
									)
								}
							/>
							<p>({results?.amountPer}%)</p>
						</div>
					</li>
					<li>
						<p>Current Holding</p>
						<p>
							{currentHolding}({results?.currentPer}%)
						</p>
					</li>
					<li>
						<p>Total Holding</p>
						<p>
							{results?.totalQua}({results?.totalPer}%)
						</p>
					</li>
					<li>
						<p>Money Debit</p>
						<p className="buyCard-total">{results?.debit}FUD</p>
					</li>
				</ul>
				<div className="buyCard-btn-container">
					<Btn text="Buy" padding="10px 30px" />
					<Btn
						text="Cancel"
						padding="10px 30px"
						color="var(--red)"
						onClick={() => setShowBuy(false)}
					/>
				</div>
			</div>
		</div>
	);
}
