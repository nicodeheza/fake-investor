"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const Stock_1 = __importDefault(require("../../../models/Stock"));
const User_1 = __importDefault(require("../../../models/User"));
const UCTDH = __importStar(require("../../../functions/updateOrCreateToDayHistory"));
const buy_1 = __importDefault(require("../../../controllers/stoks/buy"));
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
    status: function (number) {
        return this;
    },
    json: function (obj) {
        return this;
    }
};
chai_1.default.use(sinon_chai_1.default);
describe("Buy", function () {
    let statusSpy, jsonSpy, getIdFromSymbolStub, addStockStub, getStockHoldingStub, addStockOwnershipStub, updateStockQuantityStub, subtractFudStub, updateOrCreateToDayHistoryStub, addTransactionStub;
    describe("buy a stock that is not in the database and user still don't have successfully", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockStub = sinon_1.default.stub(Stock_1.default, "addStock");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                updateStockQuantityStub = sinon_1.default.stub(User_1.default, "updateStockQuantity");
                subtractFudStub = sinon_1.default.stub(User_1.default, "subtractFud");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTDH, "default");
                addTransactionStub = sinon_1.default.stub(User_1.default, "addTransaction");
                getIdFromSymbolStub.callsFake(() => Promise.resolve(undefined));
                addStockStub.callsFake(() => Promise.resolve(22));
                getStockHoldingStub.callsFake(() => Promise.resolve(undefined));
                updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));
                yield (0, buy_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
        });
        it("addStock must be called with correct argumentes", function () {
            (0, chai_1.expect)(addStockStub).to.have.been.calledWith(reqMock.body.symbol, reqMock.body.name);
        });
        it("getStockHolding must be called with correct arguments", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.calledWith(reqMock.user[0].user_id, 22);
        });
        it("addStockOwnership must be called with correct arguments", function () {
            (0, chai_1.expect)(addStockOwnershipStub).to.have.been.calledWith(reqMock.user[0].user_id, 22, reqMock.body.amount);
        });
        it("updateStockQuantity must not be call", function () {
            (0, chai_1.expect)(updateStockQuantityStub).to.have.been.callCount(0);
        });
        it("subtractFud must be called with correct arguments", function () {
            (0, chai_1.expect)(subtractFudStub).to.have.been.calledWith(reqMock.user[0].user_id, reqMock.body.price * reqMock.body.amount);
        });
        it("updateOrCreateToDayHistory must be called with correct arguments", function () {
            (0, chai_1.expect)(updateOrCreateToDayHistoryStub).to.have.been.calledWith(reqMock.user[0].user_id);
        });
        it("addTransaction must be called with correct arguments", function () {
            (0, chai_1.expect)(addTransactionStub).to.have.been.calledWith(300, 22, true, reqMock.body.price, reqMock.body.amount);
        });
        it("call res with status 200 and json {message: 'ok'} ", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "ok" });
        });
    });
    describe("buy a stock that is in the database and user already have successfully", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockStub = sinon_1.default.stub(Stock_1.default, "addStock");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                updateStockQuantityStub = sinon_1.default.stub(User_1.default, "updateStockQuantity");
                subtractFudStub = sinon_1.default.stub(User_1.default, "subtractFud");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTDH, "default");
                addTransactionStub = sinon_1.default.stub(User_1.default, "addTransaction");
                getIdFromSymbolStub.callsFake(() => Promise.resolve(22));
                addStockStub.callsFake(() => Promise.resolve(22));
                getStockHoldingStub.callsFake(() => Promise.resolve(300));
                updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));
                yield (0, buy_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
        });
        it("addStock must not be called", function () {
            (0, chai_1.expect)(addStockStub).to.have.been.callCount(0);
        });
        it("getStockHolding must be called with correct arguments", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.calledWith(reqMock.user[0].user_id, 22);
        });
        it("addStockOwnership must not be called", function () {
            (0, chai_1.expect)(addStockStub).to.have.been.callCount(0);
        });
        it("updateStockQuantity must be called with correct arguments", function () {
            (0, chai_1.expect)(updateStockQuantityStub).to.have.been.calledWith(22, reqMock.user[0].user_id, 300 + reqMock.body.amount);
        });
        it("subtractFud must be called with correct arguments", function () {
            (0, chai_1.expect)(subtractFudStub).to.have.been.calledWith(reqMock.user[0].user_id, reqMock.body.price * reqMock.body.amount);
        });
        it("updateOrCreateToDayHistory must be called with correct arguments", function () {
            (0, chai_1.expect)(updateOrCreateToDayHistoryStub).to.have.been.calledWith(reqMock.user[0].user_id);
        });
        it("addTransaction must be called with correct arguments", function () {
            (0, chai_1.expect)(addTransactionStub).to.have.been.calledWith(300, 22, true, reqMock.body.price, reqMock.body.amount);
        });
        it("call res with status 200 and json {message: 'ok'} ", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "ok" });
        });
    });
    describe("buy throw an err", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockStub = sinon_1.default.stub(Stock_1.default, "addStock");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                updateStockQuantityStub = sinon_1.default.stub(User_1.default, "updateStockQuantity");
                subtractFudStub = sinon_1.default.stub(User_1.default, "subtractFud");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTDH, "default");
                addTransactionStub = sinon_1.default.stub(User_1.default, "addTransaction");
                getIdFromSymbolStub.callsFake(() => Promise.reject("Test Error"));
                addStockStub.callsFake(() => Promise.resolve(22));
                getStockHoldingStub.callsFake(() => Promise.resolve(300));
                updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(300));
                yield (0, buy_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "Test Error" });
        });
    });
});
