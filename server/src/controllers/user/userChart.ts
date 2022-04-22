import {Request, Response} from "express";
import User from "../../models/User";
import fillUserHistoryPoints, {
	historyPoints
} from "../../functions/fillUserHistoryPoints";
import updateOrCreateToDayHistory from "../../functions/updateOrCreateToDayHistory";

export default async function userChart(req: Request, res: Response) {
	try {
		const userId = (req.user as {[key: string]: any}[])[0].user_id;
		await updateOrCreateToDayHistory(userId);
		const historyPoints: historyPoints = await User.getChartHistoryPoints(userId);
		const fillPoints = await fillUserHistoryPoints(userId, historyPoints);
		res.status(200).json(fillPoints);
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
}
