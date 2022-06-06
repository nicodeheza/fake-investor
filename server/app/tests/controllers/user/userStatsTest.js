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
const userStats_1 = __importDefault(require("../../../controllers/user/userStats"));
const GPV = __importStar(require("../../../functions/getPortfolioVal"));
const Stock_1 = __importDefault(require("../../../models/Stock"));
const User_1 = __importDefault(require("../../../models/User"));
chai_1.default.use(sinon_chai_1.default);
const reqMock = {
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
describe("UserStats Controller", function () {
    let statusSpy, jsonSpy, getIdFromSymbolStub, getPortfolioValStub, getStockHoldingStub;
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
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getPortfolioValStub = sinon_1.default.stub(GPV, "default");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                getIdFromSymbolStub.callsFake(() => Promise.resolve(22));
                getPortfolioValStub.callsFake(() => Promise.resolve(expectObj.total));
                getStockHoldingStub.callsFake(() => Promise.resolve(expectObj.liquidMon));
                yield (0, userStats_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            getIdFromSymbolStub.restore();
            getPortfolioValStub.restore();
            getStockHoldingStub.restore();
        });
        it("getPortfolioVal must be called with user id", function () {
            (0, chai_1.expect)(getPortfolioValStub).to.have.been.calledWith(1);
        });
        it("getStockHolding must be called with correct arguments", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.calledWith(1, 22);
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json mus be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith(expectObj);
        });
    });
    describe("error test", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getPortfolioValStub = sinon_1.default.stub(GPV, "default");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                getIdFromSymbolStub.callsFake(() => Promise.reject("test error"));
                getPortfolioValStub.callsFake(() => Promise.resolve(200));
                getStockHoldingStub.callsFake(() => Promise.resolve(222));
                yield (0, userStats_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            getIdFromSymbolStub.restore();
            getPortfolioValStub.restore();
            getStockHoldingStub.restore();
        });
        it("status must be 500", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
        });
        it("json must be called with the error", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "test error" });
        });
    });
});
