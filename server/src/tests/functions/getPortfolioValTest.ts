import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import User from "../../models/User";
import * as getStockData from "../../functions/getStocksData";
import getPortfolioVal from "../../functions/getPortfolioVal";

chai.use(sinonChai);

interface userStock {
	symbol: string;
	stock_name: string;
	quantity: string;
}
interface stockData {
	symbol: string;
	price: number;
	change: number;
}

function createUserStocksAndData(quantity: number) {
	return {
		stocks: new Array(quantity).fill(undefined).map((e, i) => {
			const stock: userStock = {
				symbol: "S" + i,
				stock_name: `stock number ${i}`,
				quantity: "1"
			};
			return stock;
		}),
		data: new Array(quantity).fill(undefined).map((e, i) => {
			const data: stockData = {
				symbol: "S" + i,
				price: 10,
				change: Math.random() * 50
			};
			return data;
		})
	};
}

describe("GetPortfolioVal", function () {
	let getAllStockStub: sinon.SinonStub, getStockDataStub: sinon.SinonStub;

	before(function () {
		getAllStockStub = sinon.stub(User, "getAllStock");
		getStockDataStub = sinon.stub(getStockData, "default");
	});
	after(function () {
		getAllStockStub.restore();
		getStockDataStub.restore();
	});

	it("must return correct value", async function () {
		const num = 5;
		const {stocks, data} = createUserStocksAndData(num);

		getAllStockStub.callsFake(() => Promise.resolve(stocks));
		getStockDataStub.callsFake(() => Promise.resolve(data));
		const res = await getPortfolioVal(1);
		console.log(res);
		expect(res).to.equal(num * 10);
	});
});
