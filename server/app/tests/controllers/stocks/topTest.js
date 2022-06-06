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
const top_1 = __importDefault(require("../../../controllers/stoks/top"));
const getStocksData = __importStar(require("../../../functions/getStocksData"));
const Stock_1 = __importDefault(require("../../../models/Stock"));
chai_1.default.use(sinon_chai_1.default);
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (o) {
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
    let statusSpy, jsonSpy, getTopSymbolsStub, getStocksDataStub;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            statusSpy = sinon_1.default.spy(resMock, "status");
            jsonSpy = sinon_1.default.spy(resMock, "json");
            getTopSymbolsStub = sinon_1.default.stub(Stock_1.default, "getTopSymbols");
            getStocksDataStub = sinon_1.default.stub(getStocksData, "default");
            getTopSymbolsStub.callsFake(() => Promise.resolve(stockTop));
            getStocksDataStub.callsFake(() => Promise.resolve(stockData));
            yield (0, top_1.default)(reqMock, resMock);
        });
    });
    after(function () {
        statusSpy.restore();
        jsonSpy.restore();
        getTopSymbolsStub.restore();
        getStocksDataStub.restore();
    });
    it("get stock data had been called with the correct arguments", function () {
        (0, chai_1.expect)(getStocksDataStub).to.have.been.calledWith([
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
        (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
    });
    it("res json had been called with the correct data", function () {
        (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
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
