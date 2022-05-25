import chai, {expect} from "chai";
import {Request, Response} from "express";
import * as fetch from "node-fetch";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import stockProfile from "../../../controllers/stoks/stockProfile";
import Stock from "../../../models/Stock";
import User from "../../../models/User";
import {redisClientCache} from "../../../redis/redisConn";

chai.use(sinonChai);

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (data: {}) {
		return this;
	}
};

const fakeResponse = {
	quoteResponse: {
		result: [
			{
				longName: "Test Stock",
				regularMarketPrice: 100,
				regularMarketChange: 4.5,
				regularMarketPreviousClose: 99,
				regularMarketOpen: 101,
				regularMarketDayRange: "115.26 - 119.14",
				fiftyTwoWeekRange: "53.1525 - 137.98",
				regularMarketVolume: 5000000,
				averageDailyVolume3Month: 3000000,
				regularMarketChangePercent: 3.9
			}
		]
	}
};

describe("StockProfile controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		redisGetStub: SinonStub,
		fetchStub: SinonStub,
		redisSetExStub: SinonStub,
		getIdFromSymbolStub: SinonStub,
		getStockHoldingStub: SinonStub;

	describe("call with no data in the cache and user loged", function () {
		before(async function () {
			const reqMock = {
				params: {
					symbol: "S1"
				},
				user: [
					{
						user_id: 1
					}
				]
			};
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			redisGetStub = sinon.stub(redisClientCache, "get");
			fetchStub = sinon.stub(fetch, "default");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");

			redisGetStub.callsFake(() => Promise.resolve(null));
			fetchStub.callsFake(() => Promise.resolve({json: () => fakeResponse}));
			getIdFromSymbolStub.callsFake(() => Promise.resolve(2));
			getStockHoldingStub.callsFake(() => Promise.resolve(200));

			await stockProfile(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			redisGetStub.restore();
			fetchStub.restore();
			redisSetExStub.restore();
			getIdFromSymbolStub.restore();
			getStockHoldingStub.restore();
		});
		it("redis get has been called with the correct arguments", function () {
			expect(redisGetStub).to.have.been.calledWith("stockProfile=S1");
		});
		it("fetch has been called with the correct arguments", function () {
			expect(fetchStub).to.have.been.calledWith(
				`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S1`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
		});
		it("redis setEx has been called with the correct arguments", function () {
			expect(redisSetExStub).to.have.been.calledWith(
				"stockProfile=S1",
				3600,
				JSON.stringify(fakeResponse.quoteResponse.result[0])
			);
		});
		it("getIdFromSymbol has been called with the correct arguments", function () {
			expect(getIdFromSymbolStub).to.have.been.calledWith("S1");
		});
		it("getStockHolding has been called with the correct arguments", function () {
			expect(getStockHoldingStub).to.have.been.calledWith(1, 2);
		});
		it("res status was 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("res json has been called with the correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({
				longName: fakeResponse.quoteResponse.result[0].longName,
				regularMarketPrice: fakeResponse.quoteResponse.result[0].regularMarketPrice,
				regularMarketChange: fakeResponse.quoteResponse.result[0].regularMarketChange,
				regularMarketChangePercent:
					fakeResponse.quoteResponse.result[0].regularMarketChangePercent,
				regularMarketPreviousClose:
					fakeResponse.quoteResponse.result[0].regularMarketPreviousClose,
				regularMarketOpen: fakeResponse.quoteResponse.result[0].regularMarketOpen,
				regularMarketDayRange: fakeResponse.quoteResponse.result[0].regularMarketDayRange,
				fiftyTwoWeekRange: fakeResponse.quoteResponse.result[0].fiftyTwoWeekRange,
				regularMarketVolume: fakeResponse.quoteResponse.result[0].regularMarketVolume,
				averageDailyVolume3Month:
					fakeResponse.quoteResponse.result[0].averageDailyVolume3Month,
				userProp: 200
			});
		});
	});
	describe("call with data in the cache and user unloged", function () {
		before(async function () {
			const reqMock = {
				params: {
					symbol: "S1"
				}
			};
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			redisGetStub = sinon.stub(redisClientCache, "get");
			fetchStub = sinon.stub(fetch, "default");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");

			redisGetStub.callsFake(() =>
				Promise.resolve(JSON.stringify(fakeResponse.quoteResponse.result[0]))
			);
			await stockProfile(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			redisGetStub.restore();
			fetchStub.restore();
			redisSetExStub.restore();
			getIdFromSymbolStub.restore();
			getStockHoldingStub.restore();
		});
		it("redis get has been called with the correct arguments", function () {
			expect(redisGetStub).to.have.been.calledWith("stockProfile=S1");
		});
		it("fetch hasn't been", function () {
			expect(fetchStub).to.have.been.callCount(0);
		});
		it("redis setEx hasn't been called", function () {
			expect(redisSetExStub).to.have.been.callCount(0);
		});
		it("getIdFromSymbol hasn't been called", function () {
			expect(getIdFromSymbolStub).to.have.been.callCount(0);
		});
		it("getStockHolding hasn't been called", function () {
			expect(getStockHoldingStub).to.have.been.callCount(0);
		});
		it("res status was 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("res json has been called with the correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({
				longName: fakeResponse.quoteResponse.result[0].longName,
				regularMarketPrice: fakeResponse.quoteResponse.result[0].regularMarketPrice,
				regularMarketChange: fakeResponse.quoteResponse.result[0].regularMarketChange,
				regularMarketChangePercent:
					fakeResponse.quoteResponse.result[0].regularMarketChangePercent,
				regularMarketPreviousClose:
					fakeResponse.quoteResponse.result[0].regularMarketPreviousClose,
				regularMarketOpen: fakeResponse.quoteResponse.result[0].regularMarketOpen,
				regularMarketDayRange: fakeResponse.quoteResponse.result[0].regularMarketDayRange,
				fiftyTwoWeekRange: fakeResponse.quoteResponse.result[0].fiftyTwoWeekRange,
				regularMarketVolume: fakeResponse.quoteResponse.result[0].regularMarketVolume,
				averageDailyVolume3Month:
					fakeResponse.quoteResponse.result[0].averageDailyVolume3Month,
				userProp: false
			});
		});
	});
	describe("erro test", function () {
		before(async function () {
			const reqMock = {
				params: {
					symbol: "S1"
				}
			};
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			redisGetStub = sinon.stub(redisClientCache, "get");
			fetchStub = sinon.stub(fetch, "default");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");

			redisGetStub.callsFake(() => Promise.reject("test error"));
			await stockProfile(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			redisGetStub.restore();
			fetchStub.restore();
			redisSetExStub.restore();
			getIdFromSymbolStub.restore();
			getStockHoldingStub.restore();
		});
		it("res status was 200", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("res json has been called with the correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "Nonexistent symbol"});
		});
	});
});
