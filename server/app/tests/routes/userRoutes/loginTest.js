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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const index_1 = __importDefault(require("../../../index"));
chai_1.default.use(chai_http_1.default);
describe("/user/login route", function () {
    describe("login with valid user and password", function () {
        let res, err;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/login")
                .set("Content-Type", "application/json")
                .send({
                email: "testUser@test.com",
                password: "test"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("userName must be returned", function () {
            (0, chai_1.expect)(res.body.userName).to.be.equal("testUser");
        });
    });
    describe("login with invalid password", function () {
        let res, err;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/login")
                .set("Content-Type", "application/json")
                .send({
                email: "testUser@test.com",
                password: "badPassword"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("status must be 401", function () {
            (0, chai_1.expect)(res).to.have.status(401);
        });
        it("must response an empty object", function () {
            (0, chai_1.expect)(res.body).to.be.eql({});
        });
    });
    describe("login with invalid user", function () {
        let res, err;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/login")
                .set("Content-Type", "application/json")
                .send({
                email: "badUser@test.com",
                password: "test"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("status must be 401", function () {
            (0, chai_1.expect)(res).to.have.status(401);
        });
        it("must response an empty object", function () {
            (0, chai_1.expect)(res.body).to.be.eql({});
        });
    });
});
