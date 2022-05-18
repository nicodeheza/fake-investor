import chai, {expect} from "chai";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import {redisClientCache} from "../../../redis/redisConn";
import * as f from "node-fetch";
import chart from "../../../controllers/stoks/chart";
import {Request, Response} from "express";

chai.use(sinonChai);

const reqMock = {
	params: {
		symbol: "S1"
	}
};

const resMock = {
	status: function (num: number) {
		return this;
	},
	json: function (obj: {}) {
		return this;
	}
};

const toDate = Date.now();
const oneDay = 1000 * 60 * 60 * 24;
function getDataTime(d: number) {
	const date = toDate - oneDay * d;
	return date / 1000;
}

const data = {
	chart: {
		result: [
			{
				indicators: {
					quote: [
						{
							low: [90.3, 91.2, 92.1],
							high: [90.6, 92, 92.4],
							open: [90.5, 91.1, 92.3],
							close: [90.4, 91.5, 92.2]
						}
					]
				},
				timestamp: [getDataTime(2), getDataTime(1), getDataTime(0)]
			}
		]
	}
};

describe("Stock Chart controller", function () {
	let jsonSpy: SinonSpy,
		statusSpy: SinonSpy,
		getStub: SinonStub,
		setExStub: SinonStub,
		fetchStub: SinonStub;

	describe("call with no data in cache", function () {
		before(async function () {
			jsonSpy = sinon.spy(resMock, "json");
			statusSpy = sinon.spy(resMock, "status");
			getStub = sinon.stub(redisClientCache, "get");
			setExStub = sinon.stub(redisClientCache, "setEx");
			fetchStub = sinon.stub(f, "default");

			getStub.callsFake(() => Promise.resolve(null));
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(data)}));
			await chart(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			jsonSpy.restore();
			statusSpy.restore();
			getStub.restore();
			setExStub.restore();
			fetchStub.restore();
		});
		it("redis get must be called with correct arguments", function () {
			expect(getStub).to.have.been.calledWith(`stockChart=${reqMock.params.symbol}`);
		});
		it("fetch must be called with correct arguments", function () {
			expect(fetchStub).to.have.been.calledWith(
				`https://yfapi.net/v8/finance/chart/${reqMock.params.symbol}?range=5y&region=US&interval=1d&lang=en`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
		});
		it("redis setEx must be called with correct arguments", function () {
			expect(setExStub).to.have.been.calledWith(
				`stockChart=${reqMock.params.symbol}`,
				3600,
				JSON.stringify(data)
			);
		});
		it("res status mut be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("res json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({
				timestamp: [toDate - oneDay * 2, toDate - oneDay, toDate],
				low: [90.3, 91.2, 92.1],
				high: [90.6, 92, 92.4],
				open: [90.5, 91.1, 92.3],
				close: [90.4, 91.5, 92.2]
			});
		});
	});
	describe("call with data in cache", function () {
		before(async function () {
			jsonSpy = sinon.spy(resMock, "json");
			statusSpy = sinon.spy(resMock, "status");
			getStub = sinon.stub(redisClientCache, "get");
			setExStub = sinon.stub(redisClientCache, "setEx");
			fetchStub = sinon.stub(f, "default");

			getStub.callsFake(() => Promise.resolve(JSON.stringify(data)));
			await chart(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			jsonSpy.restore();
			statusSpy.restore();
			getStub.restore();
			setExStub.restore();
			fetchStub.restore();
		});
		it("redis get must be called with correct arguments", function () {
			expect(getStub).to.have.been.calledWith(`stockChart=${reqMock.params.symbol}`);
		});
		it("fetch must not be called", function () {
			expect(fetchStub).to.have.been.callCount(0);
		});
		it("redis setEx must not be called", function () {
			expect(setExStub).to.have.been.callCount(0);
		});
		it("res status mut be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("res json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({
				timestamp: [toDate - oneDay * 2, toDate - oneDay, toDate],
				low: [90.3, 91.2, 92.1],
				high: [90.6, 92, 92.4],
				open: [90.5, 91.1, 92.3],
				close: [90.4, 91.5, 92.2]
			});
		});
	});
});
