import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import userStats from "../../../controllers/user/userStats";
import * as GPV from "../../../functions/getPortfolioVal";
import Stock from "../../../models/Stock";
import User from "../../../models/User";

chai.use(sinonChai);

const reqMock = {
	user: [
		{
			user_id: 1
		}
	]
};

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: {}) {
		return this;
	}
};

describe("UserStats Controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		getIdFromSymbolStub: SinonStub,
		getPortfolioValStub: SinonStub,
		getStockHoldingStub: SinonStub;
	describe("return data successfully", function () {
		const expectObj = {
			gainMony: 1500000,
			gainPer: 150,
			liquidMon: 2000000,
			liquidPer: 80,
			stocksMon: 500000,
			stocksPer: 20,
			total: 2500000
		};
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getPortfolioValStub = sinon.stub(GPV, "default");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");

			getIdFromSymbolStub.callsFake(() => Promise.resolve(22));
			getPortfolioValStub.callsFake(() => Promise.resolve(expectObj.total));
			getStockHoldingStub.callsFake(() => Promise.resolve(expectObj.liquidMon));

			await userStats(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getIdFromSymbolStub.restore();
			getPortfolioValStub.restore();
			getStockHoldingStub.restore();
		});
		it("getPortfolioVal must be called with user id", function () {
			expect(getPortfolioValStub).to.have.been.calledWith(1);
		});
		it("getStockHolding must be called with correct arguments", function () {
			expect(getStockHoldingStub).to.have.been.calledWith(1, 22);
		});
		it("status must be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json mus be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledWith(expectObj);
		});
	});
	describe("error test", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getPortfolioValStub = sinon.stub(GPV, "default");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");

			getIdFromSymbolStub.callsFake(() => Promise.reject("test error"));
			getPortfolioValStub.callsFake(() => Promise.resolve(200));
			getStockHoldingStub.callsFake(() => Promise.resolve(222));

			await userStats(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getIdFromSymbolStub.restore();
			getPortfolioValStub.restore();
			getStockHoldingStub.restore();
		});

		it("status must be 500", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("json must be called with the error", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "test error"});
		});
	});
});
