import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import userStocks from "../../../controllers/user/userStocks";
import * as GSD from "../../../functions/getStocksData";
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

describe("UserStocks controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		getAllStockStub: SinonStub,
		getStocksDataStub: SinonStub;
	describe("return data successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getAllStockStub = sinon.stub(User, "getAllStock");
			getStocksDataStub = sinon.stub(GSD, "default");

			getAllStockStub.callsFake(() =>
				Promise.resolve([
					{symbol: "S1", stock_name: "stock 1", quantity: "10"},
					{symbol: "S2", stock_name: "stock 2", quantity: "20"},
					{symbol: "S3", stock_name: "stock 3", quantity: "30"}
				])
			);
			getStocksDataStub.callsFake(() =>
				Promise.resolve([
					{
						symbol: "S1",
						price: 100,
						change: 1
					},
					{
						symbol: "S2",
						price: 200,
						change: 2
					},
					{
						symbol: "S3",
						price: 300,
						change: 3
					}
				])
			);
			await userStocks(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getAllStockStub.restore();
			getStocksDataStub.restore();
		});
		it("getAllStock must be called with correct arguments", function () {
			expect(getAllStockStub).to.have.been.calledWith(1);
		});
		it("getStocksData must be called with correct arguments", function () {
			expect(getStocksDataStub).to.have.been.calledWith(["S1", "S2", "S3"]);
		});
		it("status must be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledWith([
				{
					fullName: "stock 1",
					symbol: "S1",
					price: 100,
					change: 1,
					quaNum: 10,
					quaMon: 1000
				},
				{
					fullName: "stock 2",
					symbol: "S2",
					price: 200,
					change: 2,
					quaNum: 20,
					quaMon: 4000
				},
				{
					fullName: "stock 3",
					symbol: "S3",
					price: 300,
					change: 3,
					quaNum: 30,
					quaMon: 9000
				}
			]);
		});
	});
	describe("test erro", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getAllStockStub = sinon.stub(User, "getAllStock");
			getStocksDataStub = sinon.stub(GSD, "default");

			getAllStockStub.callsFake(() => Promise.resolve(Promise.reject("test error")));
			getStocksDataStub.callsFake(() =>
				Promise.resolve([
					{
						symbol: "S1",
						price: 100,
						change: 1
					}
				])
			);
			await userStocks(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getAllStockStub.restore();
			getStocksDataStub.restore();
		});
		it("status must be 500", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("json must be called with error", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "test error"});
		});
	});
});
