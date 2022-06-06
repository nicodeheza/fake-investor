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
const sell_1 = __importDefault(require("../../../controllers/stoks/sell"));
chai_1.default.use(sinon_chai_1.default);
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
    status: function (n) {
        return this;
    },
    json: function (o) {
        return this;
    }
};
const stockId = 22;
const stockHolding = 300;
const historyId = 444;
describe("Sell controller", function () {
    let statusSpy, jsonSpy, addFudStub, getIdFromSymbolStub, getStockHoldingStub, updateStockQuantityStub, updateOrCreateToDayHistoryStub, addTransactionStub;
    describe("complete the operation successfully", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                addFudStub = sinon_1.default.stub(User_1.default, "addFud");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                updateStockQuantityStub = sinon_1.default.stub(User_1.default, "updateStockQuantity");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTDH, "default");
                addTransactionStub = sinon_1.default.stub(User_1.default, "addTransaction");
                getIdFromSymbolStub.callsFake(() => Promise.resolve(stockId));
                getStockHoldingStub.callsFake(() => Promise.resolve(stockHolding));
                updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(historyId));
                yield (0, sell_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(addFudStub).to.have.been.calledWith(1, reqMock.body.amount * reqMock.body.price);
        });
        it("getIdFromSymbol must be called with correct arguments", function () {
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.calledWith(reqMock.body.symbol);
        });
        it("getStockHolding must be called with correct arguments", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.calledWith(1, stockId);
        });
        it("updateStockQuantity must be called with correct arguments", function () {
            (0, chai_1.expect)(updateStockQuantityStub).to.have.been.calledWith(stockId, 1, stockHolding - reqMock.body.amount);
        });
        it("updateOrCreateToDayHistory must be called with correct arguments", function () {
            (0, chai_1.expect)(updateOrCreateToDayHistoryStub).to.have.been.calledWith(1);
        });
        it("addTransaction must be called with correct arguments", function () {
            (0, chai_1.expect)(addTransactionStub).to.have.been.calledWith(historyId, stockId, false, reqMock.body.price, reqMock.body.amount);
        });
        it("res status mut be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("res json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "ok" });
        });
    });
    describe("unsuccessful operation", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                addFudStub = sinon_1.default.stub(User_1.default, "addFud");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                updateStockQuantityStub = sinon_1.default.stub(User_1.default, "updateStockQuantity");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTDH, "default");
                addTransactionStub = sinon_1.default.stub(User_1.default, "addTransaction");
                getIdFromSymbolStub.callsFake(() => Promise.reject("test error"));
                getStockHoldingStub.callsFake(() => Promise.resolve(stockHolding));
                updateOrCreateToDayHistoryStub.callsFake(() => Promise.resolve(historyId));
                yield (0, sell_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
        });
        it("res json must be called with correct err", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "test error" });
        });
    });
});
