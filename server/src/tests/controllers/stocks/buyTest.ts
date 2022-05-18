import chai, {expect} from "chai";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import Stock from "../../../models/Stock";
import User from "../../../models/User";
import * as UCTDH from "../../../functions/updateOrCreateToDayHistory";
import buy from "../../../controllers/stoks/buy";
import {Request, Response} from "express";

const reqMock = {
	body: {
		amount: 50,
		symbol: "S1",
		name: "Test Symbol",
		price: 100
	},
	user: [
		{
			user_id: 1
		}
	]
};
const resMock = {
	status: function (number: number) {
		return this;
	},
	json: function (obj: {}) {
		return this;
	}
};

chai.use(sinonChai);

describe("Buy", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		getIdFromSymbolStub: SinonStub,
		addStockStub: SinonStub,
		getStockHoldingStub: SinonStub,
		addStockOwnershipStub: SinonStub,
		updateStockQuantityStub: SinonStub,
		subtractFudStub: SinonStub,
		updateOrCreateToDayHistoryStub: SinonStub,
		addTransactionStub: SinonStub;

	describe("buy a stock that is not in the database and user still don't have successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockStub = sinon.stub(Stock, "addStock");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			updateStockQuantityStub = sinon.stub(User, "updateStockQuantity");
			subtractFudStub = sinon.stub(User, "subtractFud");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTDH, "default");
			addTransactionStub = sinon.stub(User, "addTransaction");

			getIdFromSymbolStub.callsFake(() => Promise.resolve(undefined));
			addStockStub.callsFake(() => Promise.resolve(22));
			getStockHoldingStub.callsFake(() => Promise.resolve(undefined));
			updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));

			await buy(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getIdFromSymbolStub.restore();
			addStockStub.restore();
			getStockHoldingStub.restore();
			addStockOwnershipStub.restore();
			updateStockQuantityStub.restore();
			subtractFudStub.restore();
			updateOrCreateToDayHistoryStub.restore();
			addTransactionStub.restore();
		});
		it("getIdFromSymbol must be called with correct argument", function () {
			expect(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
		});
		it("addStock must be called with correct argumentes", function () {
			expect(addStockStub).to.have.been.calledWith(
				reqMock.body.symbol,
				reqMock.body.name
			);
		});
		it("getStockHolding must be called with correct arguments", function () {
			expect(getStockHoldingStub).to.have.been.calledWith(reqMock.user[0].user_id, 22);
		});
		it("addStockOwnership must be called with correct arguments", function () {
			expect(addStockOwnershipStub).to.have.been.calledWith(
				reqMock.user[0].user_id,
				22,
				reqMock.body.amount
			);
		});
		it("updateStockQuantity must not be call", function () {
			expect(updateStockQuantityStub).to.have.been.callCount(0);
		});
		it("subtractFud must be called with correct arguments", function () {
			expect(subtractFudStub).to.have.been.calledWith(
				reqMock.user[0].user_id,
				reqMock.body.price * reqMock.body.amount
			);
		});
		it("updateOrCreateToDayHistory must be called with correct arguments", function () {
			expect(updateOrCreateToDayHistoryStub).to.have.been.calledWith(
				reqMock.user[0].user_id
			);
		});
		it("addTransaction must be called with correct arguments", function () {
			expect(addTransactionStub).to.have.been.calledWith(
				300,
				22,
				true,
				reqMock.body.price,
				reqMock.body.amount
			);
		});
		it("call res with status 200 and json {message: 'ok'} ", function () {
			expect(statusSpy).to.have.been.calledWith(200);
			expect(jsonSpy).to.have.been.calledWith({message: "ok"});
		});
	});
	describe("buy a stock that is in the database and user already have successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockStub = sinon.stub(Stock, "addStock");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			updateStockQuantityStub = sinon.stub(User, "updateStockQuantity");
			subtractFudStub = sinon.stub(User, "subtractFud");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTDH, "default");
			addTransactionStub = sinon.stub(User, "addTransaction");

			getIdFromSymbolStub.callsFake(() => Promise.resolve(22));
			addStockStub.callsFake(() => Promise.resolve(22));
			getStockHoldingStub.callsFake(() => Promise.resolve(300));
			updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));

			await buy(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getIdFromSymbolStub.restore();
			addStockStub.restore();
			getStockHoldingStub.restore();
			addStockOwnershipStub.restore();
			updateStockQuantityStub.restore();
			subtractFudStub.restore();
			updateOrCreateToDayHistoryStub.restore();
			addTransactionStub.restore();
		});
		it("getIdFromSymbol must be called with correct argument", function () {
			expect(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
		});
		it("addStock must not be called", function () {
			expect(addStockStub).to.have.been.callCount(0);
		});
		it("getStockHolding must be called with correct arguments", function () {
			expect(getStockHoldingStub).to.have.been.calledWith(reqMock.user[0].user_id, 22);
		});
		it("addStockOwnership must not be called", function () {
			expect(addStockStub).to.have.been.callCount(0);
		});
		it("updateStockQuantity must be called with correct arguments", function () {
			expect(updateStockQuantityStub).to.have.been.calledWith(
				22,
				reqMock.user[0].user_id,
				300 + reqMock.body.amount
			);
		});
		it("subtractFud must be called with correct arguments", function () {
			expect(subtractFudStub).to.have.been.calledWith(
				reqMock.user[0].user_id,
				reqMock.body.price * reqMock.body.amount
			);
		});
		it("updateOrCreateToDayHistory must be called with correct arguments", function () {
			expect(updateOrCreateToDayHistoryStub).to.have.been.calledWith(
				reqMock.user[0].user_id
			);
		});
		it("addTransaction must be called with correct arguments", function () {
			expect(addTransactionStub).to.have.been.calledWith(
				300,
				22,
				true,
				reqMock.body.price,
				reqMock.body.amount
			);
		});
		it("call res with status 200 and json {message: 'ok'} ", function () {
			expect(statusSpy).to.have.been.calledWith(200);
			expect(jsonSpy).to.have.been.calledWith({message: "ok"});
		});
	});
	describe("buy throw an err", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockStub = sinon.stub(Stock, "addStock");
			getStockHoldingStub = sinon.stub(User, "getStockHolding");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			updateStockQuantityStub = sinon.stub(User, "updateStockQuantity");
			subtractFudStub = sinon.stub(User, "subtractFud");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTDH, "default");
			addTransactionStub = sinon.stub(User, "addTransaction");

			getIdFromSymbolStub.callsFake(() => Promise.reject("Test Error"));
			addStockStub.callsFake(() => Promise.resolve(22));
			getStockHoldingStub.callsFake(() => Promise.resolve(300));
			updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));

			await buy(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			getIdFromSymbolStub.restore();
			addStockStub.restore();
			getStockHoldingStub.restore();
			addStockOwnershipStub.restore();
			updateStockQuantityStub.restore();
			subtractFudStub.restore();
			updateOrCreateToDayHistoryStub.restore();
			addTransactionStub.restore();
		});
		it("call res with status 500 and json {message: err} ", function () {
			expect(statusSpy).to.have.been.calledWith(500);
			expect(jsonSpy).to.have.been.calledWith({message: "Test Error"});
		});
	});
});
