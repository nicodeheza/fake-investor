import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import getHistoricalOwnerships from "../../functions/getHistoricalOwnerships";
import User from "../../models/User";

chai.use(sinonChai);

const ONE_DAY = 1000 * 60 * 60 * 24;
const TO_DATE = Date.now();

type allStoks = {
	symbol: string;
	stock_name: string;
	quantity: string;
}[];
type transFromTo = {
	history_date: Date;
	symbol: string;
	buy: boolean;
	quantity: number;
}[];

const allStockRes: allStoks = [
	{
		symbol: "S1",
		stock_name: "Stock 1",
		quantity: "100"
	},
	{
		symbol: "S2",
		stock_name: "Stock 2",
		quantity: "500"
	},
	{
		symbol: "S3",
		stock_name: "Stock 3",
		quantity: "110"
	}
];
const transactions: transFromTo = [
	{
		history_date: new Date(TO_DATE - ONE_DAY * 5),
		symbol: "S1",
		buy: false,
		quantity: 100
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 2),
		symbol: "S1",
		buy: true,
		quantity: 50
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY),
		symbol: "S1",
		buy: false,
		quantity: 50
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 5),
		symbol: "S2",
		buy: true,
		quantity: 20
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 3),
		symbol: "S2",
		buy: true,
		quantity: 20
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 2),
		symbol: "S2",
		buy: true,
		quantity: 20
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 2),
		symbol: "S2",
		buy: true,
		quantity: 20
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 5),
		symbol: "S3",
		buy: true,
		quantity: 300
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 3),
		symbol: "S3",
		buy: false,
		quantity: 100
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 2),
		symbol: "S3",
		buy: false,
		quantity: 100
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 4),
		symbol: "S4",
		buy: true,
		quantity: 50
	},
	{
		history_date: new Date(TO_DATE - ONE_DAY * 3),
		symbol: "S4",
		buy: false,
		quantity: 100
	}
];

describe("GetHistoricalOwnerships", function () {
	let getAllStockStub: sinon.SinonStub, transactionsFromToStub: sinon.SinonStub;
	beforeEach(function () {
		getAllStockStub = sinon.stub(User, "getAllStock");
		transactionsFromToStub = sinon.stub(User, "getTransactionFromDateToNow");
	});
	afterEach(function () {
		getAllStockStub.restore();
		transactionsFromToStub.restore();
	});
	it("return correct data", async function () {
		getAllStockStub.callsFake(() => Promise.resolve(allStockRes));
		transactionsFromToStub.callsFake(() => Promise.resolve(transactions));

		const res = await getHistoricalOwnerships(new Date(TO_DATE - ONE_DAY * 5), 1);

		expect(res!.S1).to.equal(200);
		expect(res!.S2).to.equal(420);
		expect(res!.S3).to.equal(10);
		expect(res!.S4).to.equal(50);
	});
});
