import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import top from "../../../controllers/stoks/top";
import * as getStocksData from "../../../functions/getStocksData";
import Stock from "../../../models/Stock";

chai.use(sinonChai);

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: {}) {
		return this;
	}
};

const reqMock = {};

const stockTop = [
	{
		symbol: "S1",
		stock_name: "test stock 1",
		"buys-num": "9000"
	},
	{
		symbol: "S2",
		stock_name: "test stock 2",
		"buys-num": "8000"
	},
	{
		symbol: "S3",
		stock_name: "test stock 3",
		"buys-num": "7000"
	},
	{
		symbol: "S4",
		stock_name: "test stock 4",
		"buys-num": "6000"
	},
	{
		symbol: "S5",
		stock_name: "test stock 5",
		"buys-num": "5000"
	},
	{
		symbol: "S6",
		stock_name: "test stock 6",
		"buys-num": "4000"
	},
	{
		symbol: "S7",
		stock_name: "test stock 7",
		"buys-num": "3000"
	},
	{
		symbol: "S8",
		stock_name: "test stock 8",
		"buys-num": "2000"
	},
	{
		symbol: "S9",
		stock_name: "test stock 9",
		"buys-num": "1000"
	},
	{
		symbol: "S10",
		stock_name: "test stock 10",
		"buys-num": "900"
	}
];

const stockData = [
	{
		symbol: "S1",
		price: 900,
		change: 2
	},
	{
		symbol: "S2",
		price: 800,
		change: 2
	},
	{
		symbol: "S3",
		price: 700,
		change: 2
	},
	{
		symbol: "S4",
		price: 600,
		change: 2
	},
	{
		symbol: "S5",
		price: 500,
		change: 2
	},
	{
		symbol: "S6",
		price: 400,
		change: 2
	},
	{
		symbol: "S7",
		price: 300,
		change: 2
	},
	{
		symbol: "S8",
		price: 200,
		change: 2
	},
	{
		symbol: "S9",
		price: 100,
		change: 2
	},
	{
		symbol: "S10",
		price: 90,
		change: 2
	}
];

describe("top controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		getTopSymbolsStub: SinonStub,
		getStocksDataStub: SinonStub;

	before(async function () {
		statusSpy = sinon.spy(resMock, "status");
		jsonSpy = sinon.spy(resMock, "json");
		getTopSymbolsStub = sinon.stub(Stock, "getTopSymbols");
		getStocksDataStub = sinon.stub(getStocksData, "default");

		getTopSymbolsStub.callsFake(() => Promise.resolve(stockTop));
		getStocksDataStub.callsFake(() => Promise.resolve(stockData));

		await top(reqMock as unknown as Request, resMock as Response);
	});
	after(function () {
		statusSpy.restore();
		jsonSpy.restore();
		getTopSymbolsStub.restore();
		getStocksDataStub.restore();
	});
	it("get stock data had been called with the correct arguments", function () {
		expect(getStocksDataStub).to.have.been.calledWith([
			"S1",
			"S2",
			"S3",
			"S4",
			"S5",
			"S6",
			"S7",
			"S8",
			"S9",
			"S10"
		]);
	});
	it("res status was 200", function () {
		expect(statusSpy).to.have.been.calledWith(200);
	});
	it("res json had been called with the correct data", function () {
		expect(jsonSpy).to.have.been.calledWith({
			1: {
				name: "test stock 1(S1)",
				symbol: "S1",
				price: 900,
				variation: (2 * 100) / 900
			},
			2: {
				name: "test stock 2(S2)",
				symbol: "S2",
				price: 800,
				variation: (2 * 100) / 800
			},
			3: {
				name: "test stock 3(S3)",
				symbol: "S3",
				price: 700,
				variation: (2 * 100) / 700
			},
			4: {
				name: "test stock 4(S4)",
				symbol: "S4",
				price: 600,
				variation: (2 * 100) / 600
			},
			5: {
				name: "test stock 5(S5)",
				symbol: "S5",
				price: 500,
				variation: (2 * 100) / 500
			},
			6: {
				name: "test stock 6(S6)",
				symbol: "S6",
				price: 400,
				variation: (2 * 100) / 400
			},
			7: {
				name: "test stock 7(S7)",
				symbol: "S7",
				price: 300,
				variation: (2 * 100) / 300
			},
			8: {
				name: "test stock 8(S8)",
				symbol: "S8",
				price: 200,
				variation: (2 * 100) / 200
			},
			9: {
				name: "test stock 9(S9)",
				symbol: "S9",
				price: 100,
				variation: (2 * 100) / 100
			},
			10: {
				name: "test stock 10(S10)",
				symbol: "S10",
				price: 90,
				variation: (2 * 100) / 90
			}
		});
	});
});
