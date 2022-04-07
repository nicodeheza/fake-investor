import User from "../models/User";
import getPortfolioVal from "./getPortfolioVal";

export default async function updateOrCreateToDayHistory(userId: number) {
	let historyPoint: any = await User.getToDayHistory(userId);
	let historyId: number;
	const portfolioVal = await getPortfolioVal(userId);
	const liquid = await User.getFudQuantity(userId);
	if (!historyPoint) {
		console.log("not history");
		const h = await User.addHistory(userId, portfolioVal!, liquid!);
		historyId = (h as {[key: string]: any}).insertId;
	} else {
		console.log(historyPoint);
		historyId = historyPoint.history_id;
		await User.updateHistory(historyId, portfolioVal!, liquid!);
	}

	return historyId;
}
