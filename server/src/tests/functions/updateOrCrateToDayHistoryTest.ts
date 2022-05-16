import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import User from "../../models/User";
import * as portfolioVal from "../../functions/getPortfolioVal";
import updateOrCreateToDayHistory from "../../functions/updateOrCreateToDayHistory";

chai.use(sinonChai);

describe("UpdateOrCreateToDayHistory", function () {
	let getToDayHistoryStub: sinon.SinonStub,
		getPortfolioValStub: sinon.SinonStub,
		getFudQuantityStub: sinon.SinonStub,
		addHistoryStub: sinon.SinonStub,
		updateHistoryStub: sinon.SinonStub;

	describe("create history", function () {
		beforeEach(function () {
			getToDayHistoryStub = sinon.stub(User, "getToDayHistory");
			getPortfolioValStub = sinon.stub(portfolioVal, "default");
			getFudQuantityStub = sinon.stub(User, "getFudQuantity");
			addHistoryStub = sinon.stub(User, "addHistory");
			updateHistoryStub = sinon.stub(User, "updateHistory");

			getToDayHistoryStub.callsFake(() => Promise.resolve(null));
			getPortfolioValStub.callsFake(() => Promise.resolve(1000));
			getFudQuantityStub.callsFake(() => Promise.resolve(100));
			addHistoryStub.callsFake(() => Promise.resolve({insertId: 22}));
		});
		afterEach(function () {
			getToDayHistoryStub.restore();
			getPortfolioValStub.restore();
			getFudQuantityStub.restore();
			addHistoryStub.restore();
			updateHistoryStub.restore();
		});
		it("addHistory must be call with correct arguments", async function () {
			await updateOrCreateToDayHistory(1);
			expect(addHistoryStub).to.have.been.calledWith(1, 1000, 100);
		});
		it("updateHistory must not be call", async function () {
			await updateOrCreateToDayHistory(1);
			expect(updateHistoryStub).to.have.been.callCount(0);
		});
		it("return correct id", async function () {
			const res = await updateOrCreateToDayHistory(1);
			expect(res).to.equal(22);
		});
	});
	describe("update history", function () {
		beforeEach(function () {
			getToDayHistoryStub = sinon.stub(User, "getToDayHistory");
			getPortfolioValStub = sinon.stub(portfolioVal, "default");
			getFudQuantityStub = sinon.stub(User, "getFudQuantity");
			addHistoryStub = sinon.stub(User, "addHistory");
			updateHistoryStub = sinon.stub(User, "updateHistory");

			getToDayHistoryStub.callsFake(() =>
				Promise.resolve({
					history_id: 22,
					history_date: new Date(),
					user_id: 1,
					portfolio_value: 1000,
					liquid: 100
				})
			);
			getPortfolioValStub.callsFake(() => Promise.resolve(2000));
			getFudQuantityStub.callsFake(() => Promise.resolve(200));
		});
		afterEach(function () {
			getToDayHistoryStub.restore();
			getPortfolioValStub.restore();
			getFudQuantityStub.restore();
			addHistoryStub.restore();
			updateHistoryStub.restore();
		});
		it("addHistory must not be call", async function () {
			await updateOrCreateToDayHistory(1);
			expect(addHistoryStub).to.have.been.callCount(0);
		});
		it("updateHistory must be called with correct arguments", async function () {
			await updateOrCreateToDayHistory(1);
			expect(updateHistoryStub).to.have.been.calledWith(22, 2000, 200);
		});
		it("return correct id", async function () {
			const res = await updateOrCreateToDayHistory(1);
			expect(res).to.equal(22);
		});
	});
});
