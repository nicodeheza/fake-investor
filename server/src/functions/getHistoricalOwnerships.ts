import User from "../models/User";

export default async function getHistoricalOwnerships(date: Date, userId: number) {
	try {
		const userActualStoksArr = await User.getAllStock(userId);
		const transactions = await User.getTransactionFromDateToNow(userId, date);
		const userStoks: {
			[key: string]: number;
		} = {};
		(userActualStoksArr as {[key: string]: string}[]).forEach((obj) => {
			if (obj.symbol !== "FUD") {
				userStoks[obj.symbol] = parseInt(obj.quantity);
			}
		});
		transactions?.forEach((ele) => {
			if (ele.buy) {
				userStoks[ele.symbol] -= ele.quantity;
			} else {
				userStoks[ele.symbol] += ele.quantity;
			}
		});
		return userStoks;
	} catch (err) {
		console.log(err);
	}
}
