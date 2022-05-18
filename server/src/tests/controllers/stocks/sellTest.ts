import chai, {expect} from "chai";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import Stock from "../../../models/Stock";
import User from "../../../models/User";
import * as UCTDH from "../../../functions/updateOrCreateToDayHistory";
import sell from "../../../controllers/stoks/sell";
import {Request, Response} from "express";

chai.use(sinonChai);

const reqMock = {
	body: {
		symbol: "S1",
		name: "Test Stock",
		amount: 5,
		price: 100
	},
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

const stockId = 22;
const stockHolding = 300;
const historyId = 444;

describe("Sell controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		addFudStub: SinonStub,
		getIdFromSymbolStub: SinonStub,
		getStockHoldingStub: SinonStub,
		updateStockQuantityStub: SinonStub,
		updateOrCreateToDayHistoryStub: SinonStub,
		addTransactionStub: SinonStub;

	describe("complete the operation successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			addFudStub = sinon.stub(User, "addFud");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");
			updateStockQuantityStub = sinon.stub(User, "updateStockQuantity");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTDH, "default");
			addTransactionStub = sinon.stub(User, "addTransaction");

			getIdFromSymbolStub.callsFake(() => Promise.resolve(stockId));
			getStockHoldingStub.callsFake(() => Promise.resolve(stockHolding));
			updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(historyId));

			await sell(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			addFudStub.restore();
			getIdFromSymbolStub.restore();
			getStockHoldingStub.restore();
			updateStockQuantityStub.restore();
			updateOrCreateToDayHistoryStub.restore();
			addTransactionStub.restore();
		});
		it("addFud must be called with correct arguments", function () {
			expect(addFudStub).to.have.been.calledWith(
				1,
				reqMock.body.amount * reqMock.body.price
			);
		});
		it("getIdFromSymbol must be called with correct arguments", function () {
			expect(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
		});
		it("getStockHolding must be called with correct arguments", function () {
			expect(getStockHoldingStub).to.have.been.calledWith(1, stockId);
		});
		it("updateStockQuantity must be called with correct arguments", function () {
			expect(updateStockQuantityStub).to.have.been.calledWith(
				stockId,
				1,
				stockHolding - reqMock.body.amount
			);
		});
		it("updateOrCreateToDayHistory must be called with correct arguments", function () {
			expect(updateOrCreateToDayHistoryStub).to.have.been.calledWith(1);
		});
		it("addTransaction must be called with correct arguments", function () {
			expect(addTransactionStub).to.have.been.calledWith(
				historyId,
				stockId,
				false,
				reqMock.body.price,
				reqMock.body.amount
			);
		});
		it("res status mut be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("res json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "ok"});
		});
	});
	describe("unsuccessful operation", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			addFudStub = sinon.stub(User, "addFud");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");
			updateStockQuantityStub = sinon.stub(User, "updateStockQuantity");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTDH, "default");
			addTransactionStub = sinon.stub(User, "addTransaction");

			getIdFromSymbolStub.callsFake(() => Promise.reject("test error"));
			getStockHoldingStub.callsFake(() => Promise.resolve(stockHolding));
			updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(historyId));

			await sell(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			addFudStub.restore();
			getIdFromSymbolStub.restore();
			getStockHoldingStub.restore();
			updateStockQuantityStub.restore();
			updateOrCreateToDayHistoryStub.restore();
			addTransactionStub.restore();
		});
		it("res status mut be 500", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("res json must be called with correct err", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "test error"});
		});
	});
});
