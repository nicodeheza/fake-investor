"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const password_1 = require("../../functions/password");
describe("Password Functions", function () {
    describe("CreateHash", function () {
        it("must return a hash and a salt", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, password_1.createHash)("myTestPassword");
                (0, chai_1.expect)(res).to.haveOwnProperty("hash");
                (0, chai_1.expect)(res).to.haveOwnProperty("salt");
                (0, chai_1.expect)(res.salt).to.be.a("string");
                (0, chai_1.expect)(res.hash).to.be.a("string");
                (0, chai_1.expect)(res.hash).to.not.equal("myTestPassword");
            });
        });
    });
    describe("CheckPassword", function () {
        let hash;
        let salt;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, password_1.createHash)("myTestPassword");
                hash = res.hash;
                salt = res.salt;
            });
        });
        it("correct password", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, password_1.checkPassword)("myTestPassword", hash, salt);
                (0, chai_1.expect)(res).to.equal(true);
            });
        });
        it("incorrect password", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, password_1.checkPassword)("myBadPassword", hash, salt);
                (0, chai_1.expect)(res).to.equal(false);
            });
        });
    });
});
