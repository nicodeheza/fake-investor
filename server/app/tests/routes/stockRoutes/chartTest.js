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
const chai_http_1 = __importDefault(require("chai-http"));
const index_1 = __importDefault(require("../../../index"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const node_fetch = __importStar(require("node-fetch"));
const redisConn_1 = require("../../../redis/redisConn");
chai_1.default.use(chai_http_1.default);
chai_1.default.use(sinon_chai_1.default);
const apiRes = {
    chart: {
        result: [
            {
                meta: {
                    currency: "USD",
                    symbol: "AAPL",
                    exchangeName: "NMS",
                    instrumentType: "EQUITY",
                    firstTradeDate: 345479400,
                    regularMarketTime: 1623182403,
                    gmtoffset: -14400,
                    timezone: "EDT",
                    exchangeTimezoneName: "America/New_York",
                    regularMarketPrice: 126.74,
                    chartPreviousClose: 130.21,
                    priceHint: 2,
                    currentTradingPeriod: {
                        pre: {
                            timezone: "EDT",
                            start: 1623139200,
                            end: 1623159000,
                            gmtoffset: -14400
                        },
                        regular: {
                            timezone: "EDT",
                            start: 1623159000,
                            end: 1623182400,
                            gmtoffset: -14400
                        },
                        post: {
                            timezone: "EDT",
                            start: 1623182400,
                            end: 1623196800,
                            gmtoffset: -14400
                        }
                    },
                    dataGranularity: "1d",
                    range: "1mo",
                    validRanges: [
                        "5d",
                        "1y",
                        "6mo",
                        "1d",
                        "2y",
                        "5y",
                        "ytd",
                        "1mo",
                        "10y",
                        "3mo",
                        "max"
                    ]
                },
                timestamp: [
                    1620653400, 1620739800, 1620826200, 1620912600, 1620999000, 1621258200,
                    1621344600, 1621431000, 1621517400, 1621603800, 1621863000, 1621949400,
                    1622035800, 1622122200, 1622208600, 1622554200, 1622640600, 1622727000,
                    1622813400, 1623072600, 1623182403
                ],
                comparisons: [
                    {
                        symbol: "MSFT",
                        high: [
                            251.73, 246.6, 244.38, 245.6, 249.18, 246.59, 246.41, 243.23, 247.95,
                            248.33, 251.16, 252.75, 252.94, 251.48, 252.08, 251.29, 249.27, 246.34,
                            251.65, 254.09, 256.01
                        ],
                        low: [
                            247.12, 242.57, 238.07, 241.42, 245.49, 243.52, 242.9, 238.6, 243.86,
                            244.74, 247.51, 250.82, 250.75, 249.25, 249.56, 246.96, 245.84, 243, 247.51,
                            249.81, 252.515
                        ],
                        chartPreviousClose: 252.46,
                        close: [
                            247.18, 246.23, 239, 243.03, 248.15, 245.18, 243.08, 243.12, 246.48, 245.17,
                            250.78, 251.72, 251.49, 249.31, 249.68, 247.4, 247.3, 245.71, 250.79,
                            253.81, 252.57
                        ],
                        open: [
                            250.87, 244.55, 242.17, 241.8, 245.58, 246.55, 246.27, 239.31, 243.96,
                            247.57, 247.79, 251.77, 251.43, 251.17, 251, 251.23, 248.13, 245.22, 247.76,
                            249.98, 255.16
                        ]
                    },
                    {
                        symbol: "^VIX",
                        high: [
                            19.75, 23.73, 28.38, 28.93, 22.1, 21.58, 21.45, 25.96, 23.5, 20.89, 20.51,
                            19.29, 18.92, 18.17, 16.86, 18.53, 18.31, 19.27, 18.42, 17.35, 17.75
                        ],
                        low: [
                            17.07, 20.71, 21.66, 22.23, 18.66, 19.67, 18.81, 21.88, 20.19, 19.53, 18.38,
                            16.87, 17.35, 16.52, 15.9, 15.68, 16.74, 17.45, 16.18, 15.78, 15.15
                        ],
                        chartPreviousClose: 16.69,
                        close: [
                            19.66, 21.84, 27.59, 23.13, 18.81, 19.72, 21.34, 22.18, 20.67, 20.15, 18.4,
                            18.84, 17.36, 16.74, 16.76, 17.9, 17.48, 18.04, 16.42, 16.42, 17.07
                        ],
                        open: [
                            17.34, 21.17, 22.42, 26.03, 21.77, 19.89, 18.89, 22.46, 22.33, 20.42, 20.5,
                            18.35, 18.37, 18.03, 16.8, 17.24, 17.86, 17.73, 18.09, 17.34, 16.58
                        ]
                    }
                ],
                indicators: {
                    quote: [
                        {
                            low: [
                                126.80999755859375, 122.7699966430664, 122.25, 124.26000213623047,
                                125.8499984741211, 125.16999816894531, 124.77999877929688,
                                122.86000061035156, 125.0999984741211, 125.20999908447266,
                                125.94000244140625, 126.31999969482422, 126.41999816894531,
                                125.08000183105469, 124.55000305175781, 123.94000244140625,
                                124.05000305175781, 123.12999725341797, 123.8499984741211,
                                124.83000183105469, 126.21009826660156
                            ],
                            high: [
                                129.5399932861328, 126.2699966430664, 124.63999938964844,
                                126.1500015258789, 127.88999938964844, 126.93000030517578,
                                126.98999786376953, 124.91999816894531, 127.72000122070312, 128,
                                127.94000244140625, 128.32000732421875, 127.38999938964844,
                                127.63999938964844, 125.80000305175781, 125.3499984741211,
                                125.23999786376953, 124.8499984741211, 126.16000366210938,
                                126.31999969482422, 128.4600067138672
                            ],
                            open: [
                                129.41000366210938, 123.5, 123.4000015258789, 124.58000183105469, 126.25,
                                126.81999969482422, 126.55999755859375, 123.16000366210938,
                                125.2300033569336, 127.81999969482422, 126.01000213623047,
                                127.81999969482422, 126.95999908447266, 126.44000244140625,
                                125.56999969482422, 125.08000183105469, 124.27999877929688,
                                124.68000030517578, 124.06999969482422, 126.16999816894531,
                                126.5999984741211
                            ],
                            close: [
                                126.8499984741211, 125.91000366210938, 122.7699966430664,
                                124.97000122070312, 127.44999694824219, 126.2699966430664,
                                124.8499984741211, 124.69000244140625, 127.30999755859375,
                                125.43000030517578, 127.0999984741211, 126.9000015258789,
                                126.8499984741211, 125.27999877929688, 124.61000061035156,
                                124.27999877929688, 125.05999755859375, 123.54000091552734,
                                125.88999938964844, 125.9000015258789, 126.73999786376953
                            ],
                            volume: [
                                88071200, 126142800, 112172300, 105861300, 81806500, 74244600, 63342900,
                                92612000, 76857100, 79295400, 63092900, 72009500, 56575900, 94625600,
                                71311100, 67637100, 59278900, 76229200, 75087300, 70927000, 72497627
                            ]
                        }
                    ],
                    adjclose: [
                        {
                            adjclose: [
                                126.8499984741211, 125.91000366210938, 122.7699966430664,
                                124.97000122070312, 127.44999694824219, 126.2699966430664,
                                124.8499984741211, 124.69000244140625, 127.30999755859375,
                                125.43000030517578, 127.0999984741211, 126.9000015258789,
                                126.8499984741211, 125.27999877929688, 124.61000061035156,
                                124.27999877929688, 125.05999755859375, 123.54000091552734,
                                125.88999938964844, 125.9000015258789, 126.73999786376953
                            ]
                        }
                    ]
                }
            }
        ],
        error: null
    }
};
const expectRes = {
    timestamp: [
        1620653400000, 1620739800000, 1620826200000, 1620912600000, 1620999000000,
        1621258200000, 1621344600000, 1621431000000, 1621517400000, 1621603800000,
        1621863000000, 1621949400000, 1622035800000, 1622122200000, 1622208600000,
        1622554200000, 1622640600000, 1622727000000, 1622813400000, 1623072600000,
        1623182403000
    ],
    close: [
        126.8499984741211, 125.91000366210938, 122.7699966430664, 124.97000122070312,
        127.44999694824219, 126.2699966430664, 124.8499984741211, 124.69000244140625,
        127.30999755859375, 125.43000030517578, 127.0999984741211, 126.9000015258789,
        126.8499984741211, 125.27999877929688, 124.61000061035156, 124.27999877929688,
        125.05999755859375, 123.54000091552734, 125.88999938964844, 125.9000015258789,
        126.73999786376953
    ],
    low: [
        126.80999755859375, 122.7699966430664, 122.25, 124.26000213623047, 125.8499984741211,
        125.16999816894531, 124.77999877929688, 122.86000061035156, 125.0999984741211,
        125.20999908447266, 125.94000244140625, 126.31999969482422, 126.41999816894531,
        125.08000183105469, 124.55000305175781, 123.94000244140625, 124.05000305175781,
        123.12999725341797, 123.8499984741211, 124.83000183105469, 126.21009826660156
    ],
    open: [
        129.41000366210938, 123.5, 123.4000015258789, 124.58000183105469, 126.25,
        126.81999969482422, 126.55999755859375, 123.16000366210938, 125.2300033569336,
        127.81999969482422, 126.01000213623047, 127.81999969482422, 126.95999908447266,
        126.44000244140625, 125.56999969482422, 125.08000183105469, 124.27999877929688,
        124.68000030517578, 124.06999969482422, 126.16999816894531, 126.5999984741211
    ],
    high: [
        129.5399932861328, 126.2699966430664, 124.63999938964844, 126.1500015258789,
        127.88999938964844, 126.93000030517578, 126.98999786376953, 124.91999816894531,
        127.72000122070312, 128, 127.94000244140625, 128.32000732421875, 127.38999938964844,
        127.63999938964844, 125.80000305175781, 125.3499984741211, 125.23999786376953,
        124.8499984741211, 126.16000366210938, 126.31999969482422, 128.4600067138672
    ]
};
describe("/stock/chart route", function () {
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisConn_1.redisClientCache.flushDb();
        });
    });
    describe("request with no cached data", function () {
        let res, fetchStub;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
            chai_1.default
                .request(index_1.default)
                .get("/api/stock/chart/AAPL")
                .end((e, r) => {
                res = r;
                done();
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("data must be fetched from yfApi", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.called;
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("correct data must be returned", function () {
            (0, chai_1.expect)(res.body).to.be.eql(expectRes);
        });
    });
    describe("request with cached data", function () {
        let res, fetchStub;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chai_1.default
                .request(index_1.default)
                .get("/api/stock/chart/AAPL")
                .end((e, r) => {
                res = r;
                done();
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("data must be fetched from redis cache", function () {
            (0, chai_1.expect)(fetchStub).to.have.not.been.called;
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("correct data must be returned", function () {
            (0, chai_1.expect)(res.body).to.be.eql(expectRes);
        });
    });
});
