import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import * as getHistoricalOwn from "../../functions/getHistoricalOwnerships";
import * as getStockHisPrice from "../../functions/getStockHistoricalPrice";
import fillUserHistoryPoints, {
	historyPoints
} from "../../functions/fillUserHistoryPoints";
import User from "../../models/User";

chai.use(sinonChai);
const TODAY = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;
function getPassDay(n: number) {
	return TODAY - ONE_DAY * n;
}

const points: historyPoints = {
	[getPassDay(10)]: {
		portfolioValue: 17000,
		liquid: 8000,
		transactions: [
			{
				price: 100,
				quantity: 10,
				buy: true,
				symbol: "S1"
			}
		]
	},
	[getPassDay(9)]: {
		portfolioValue: 16000,
		liquid: 7000,
		transactions: [
			{
				price: 200,
				quantity: 5,
				buy: true,
				symbol: "S2"
			}
		]
	},
	[getPassDay(5)]: {
		portfolioValue: 16500,
		liquid: 7500,
		transactions: [
			{
				price: 200,
				quantity: 5,
				buy: true,
				symbol: "S3"
			},
			{
				price: 300,
				quantity: 5,
				buy: false,
				symbol: "S2"
			}
		]
	},
	[getPassDay(4)]: {
		portfolioValue: 17000,
		liquid: 8000,
		transactions: [
			{
				price: 100,
				quantity: 5,
				buy: false,
				symbol: "S3"
			}
		]
	},
	[TODAY]: {
		portfolioValue: 17000,
		liquid: 8000,
		transactions: []
	}
};

describe("FillUserHistoryPoints", function () {
	let getHistoricalOwnershipsStub: sinon.SinonStub,
		getStockHistoricalPriceStub: sinon.SinonStub,
		addHistoryStub: sinon.SinonStub;
	beforeEach(function () {
		getHistoricalOwnershipsStub = sinon.stub(getHistoricalOwn, "default");
		getStockHistoricalPriceStub = sinon.stub(getStockHisPrice, "default");
		addHistoryStub = sinon.stub(User, "addHistory");

		getHistoricalOwnershipsStub.callsFake(() =>
			Promise.resolve({
				S1: 10,
				S2: 10,
				S3: 10
			})
		);
		getStockHistoricalPriceStub.callsFake((arr) => {
			return Promise.resolve(
				arr.map((obj: {symbol: string; date: number}) => {
					return {
						symbol: obj.symbol,
						date: obj.date,
						price: 100
					};
				})
			);
		});
	});
	afterEach(function () {
		getHistoricalOwnershipsStub.restore();
		getStockHistoricalPriceStub.restore();
		addHistoryStub.restore();
	});
	it("should return all consecutive dates from the start date to the current date", async function () {
		const res = await fillUserHistoryPoints(1, points);
		const dates = Object.keys(res as object);
		dates.sort((a, b) => parseInt(a) - parseInt(b));
		for (let i = 0; i < dates.length - 1; i++) {
			const actualDate = new Date(parseInt(dates[i]));
			actualDate.setHours(0, 0, 0, 0);
			const tomorrow = new Date(actualDate);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);
			const nextDate = new Date(parseInt(dates[i + 1]));
			nextDate.setHours(0, 0, 0, 0);
			expect(nextDate).to.deep.equal(tomorrow);
		}
	});
	it("must return correct data", async function () {
		const res = await fillUserHistoryPoints(1, points);
		const createdPoints = Object.keys(res as object).filter((e) => !points[e]);
		createdPoints.forEach((e) => {
			const eNum = parseInt(e);
			let lastLiquid;
			if (eNum > getPassDay(9) && eNum < getPassDay(5)) {
				lastLiquid = points[getPassDay(9)].liquid;
			} else {
				lastLiquid = points[getPassDay(4)].liquid;
			}
			expect(res![e].liquid).to.equal(lastLiquid);
			expect(res![e].transactions).to.have.lengthOf(0);
			expect(res![e].portfolioValue).to.equal(lastLiquid + 3000);
		});
	});
	it("getHistoricalOwnerships must be called the correct times with the correct arguments", async function () {
		await fillUserHistoryPoints(1, points);

		expect(getHistoricalOwnershipsStub).to.have.been.calledTwice;
		[getPassDay(9), getPassDay(4)].forEach((e) => {
			expect(getHistoricalOwnershipsStub).to.have.been.calledWith(new Date(e), 1);
		});
	});
	it("getStockHistoricalPrice must be called the correct times with the correct arguments", async function () {
		const res = await fillUserHistoryPoints(1, points);
		const createdPoints = Object.keys(res as object).filter((e) => !points[e]);
		createdPoints.sort((a, b) => parseInt(a) - parseInt(b));

		const symbols = ["S1", "S2", "S3"];

		expect(getStockHistoricalPriceStub).to.have.been.callCount(createdPoints.length);
		createdPoints.forEach((ele) => {
			expect(getStockHistoricalPriceStub).to.have.been.calledWith(
				symbols.map((symbol) => {
					return {
						symbol,
						date: parseInt(ele)
					};
				})
			);
		});
	});
	it("add history must be called the correct times with the correct arguments", async function () {
		const res = await fillUserHistoryPoints(1, points);
		const createdPoints = Object.keys(res as object).filter((e) => !points[e]);
		createdPoints.sort((a, b) => parseInt(a) - parseInt(b));

		const symbols = ["S1", "S2", "S3"];

		expect(addHistoryStub).to.have.been.callCount(createdPoints.length);
		createdPoints.forEach((ele) => {
			expect(addHistoryStub).to.have.been.calledWith(
				1,
				res![ele].portfolioValue,
				res![ele].liquid,
				new Date(parseInt(ele))
			);
		});
	});
});
