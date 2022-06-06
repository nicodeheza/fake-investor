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
const redisConn_1 = require("../../../redis/redisConn");
const f = __importStar(require("node-fetch"));
const chart_1 = __importDefault(require("../../../controllers/stoks/chart"));
chai_1.default.use(sinon_chai_1.default);
const reqMock = {
    params: {
        symbol: "S1"
    }
};
const resMock = {
    status: function (num) {
        return this;
    },
    json: function (obj) {
        return this;
    }
};
const toDate = Date.now();
const oneDay = 1000 * 60 * 60 * 24;
function getDataTime(d) {
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
    let jsonSpy, statusSpy, getStub, setExStub, fetchStub;
    describe("call with no data in cache", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                jsonSpy = sinon_1.default.spy(resMock, "json");
                statusSpy = sinon_1.default.spy(resMock, "status");
                getStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
                setExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
                fetchStub = sinon_1.default.stub(f, "default");
                getStub.callsFake(() => Promise.resolve(null));
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(data) }));
                yield (0, chart_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            jsonSpy.restore();
            statusSpy.restore();
            getStub.restore();
            setExStub.restore();
            fetchStub.restore();
        });
        it("redis get must be called with correct arguments", function () {
            (0, chai_1.expect)(getStub).to.have.been.calledWith(`stockChart=${reqMock.params.symbol}`);
        });
        it("fetch must be called with correct arguments", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v8/finance/chart/${reqMock.params.symbol}?range=5y&region=US&interval=1d&lang=en`, {
                method: "GET",
                headers: {
                    "x-api-key": process.env.YF_API_KEY || "",
                    "Content-Type": "application/json"
                }
            });
        });
        it("redis setEx must be called with correct arguments", function () {
            (0, chai_1.expect)(setExStub).to.have.been.calledWith(`stockChart=${reqMock.params.symbol}`, 3600, JSON.stringify(data));
        });
        it("res status mut be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("res json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                timestamp: [toDate - oneDay * 2, toDate - oneDay, toDate],
                low: [90.3, 91.2, 92.1],
                high: [90.6, 92, 92.4],
                open: [90.5, 91.1, 92.3],
                close: [90.4, 91.5, 92.2]
            });
        });
    });
    describe("call with data in cache", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                jsonSpy = sinon_1.default.spy(resMock, "json");
                statusSpy = sinon_1.default.spy(resMock, "status");
                getStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
                setExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
                fetchStub = sinon_1.default.stub(f, "default");
                getStub.callsFake(() => Promise.resolve(JSON.stringify(data)));
                yield (0, chart_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            jsonSpy.restore();
            statusSpy.restore();
            getStub.restore();
            setExStub.restore();
            fetchStub.restore();
        });
        it("redis get must be called with correct arguments", function () {
            (0, chai_1.expect)(getStub).to.have.been.calledWith(`stockChart=${reqMock.params.symbol}`);
        });
        it("fetch must not be called", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.callCount(0);
        });
        it("redis setEx must not be called", function () {
            (0, chai_1.expect)(setExStub).to.have.been.callCount(0);
        });
        it("res status mut be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("res json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                timestamp: [toDate - oneDay * 2, toDate - oneDay, toDate],
                low: [90.3, 91.2, 92.1],
                high: [90.6, 92, 92.4],
                open: [90.5, 91.1, 92.3],
                close: [90.4, 91.5, 92.2]
            });
        });
    });
});
