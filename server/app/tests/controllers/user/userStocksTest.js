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
const userStocks_1 = __importDefault(require("../../../controllers/user/userStocks"));
const GSD = __importStar(require("../../../functions/getStocksData"));
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
describe("UserStocks controller", function () {
    let statusSpy, jsonSpy, getAllStockStub, getStocksDataStub;
    describe("return data successfully", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getAllStockStub = sinon_1.default.stub(User_1.default, "getAllStock");
                getStocksDataStub = sinon_1.default.stub(GSD, "default");
                getAllStockStub.callsFake(() => Promise.resolve([
                    { symbol: "S1", stock_name: "stock 1", quantity: "10" },
                    { symbol: "S2", stock_name: "stock 2", quantity: "20" },
                    { symbol: "S3", stock_name: "stock 3", quantity: "30" }
                ]));
                getStocksDataStub.callsFake(() => Promise.resolve([
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
                ]));
                yield (0, userStocks_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            getAllStockStub.restore();
            getStocksDataStub.restore();
        });
        it("getAllStock must be called with correct arguments", function () {
            (0, chai_1.expect)(getAllStockStub).to.have.been.calledWith(1);
        });
        it("getStocksData must be called with correct arguments", function () {
            (0, chai_1.expect)(getStocksDataStub).to.have.been.calledWith(["S1", "S2", "S3"]);
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith([
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
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getAllStockStub = sinon_1.default.stub(User_1.default, "getAllStock");
                getStocksDataStub = sinon_1.default.stub(GSD, "default");
                getAllStockStub.callsFake(() => Promise.resolve(Promise.reject("test error")));
                getStocksDataStub.callsFake(() => Promise.resolve([
                    {
                        symbol: "S1",
                        price: 100,
                        change: 1
                    }
                ]));
                yield (0, userStocks_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            getAllStockStub.restore();
            getStocksDataStub.restore();
        });
        it("status must be 500", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
        });
        it("json must be called with error", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "test error" });
        });
    });
});
