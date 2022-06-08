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
exports.redisClientCache = void 0;
require("dotenv/config");
const redis_1 = require("redis");
exports.redisClientCache = (0, redis_1.createClient)(process.env.NODE_ENV === "production" ? { url: process.env.REDIS_URL } : {});
(() => __awaiter(void 0, void 0, void 0, function* () {
    exports.redisClientCache.on("connect", () => console.log("redis cache connected"));
    exports.redisClientCache.on("error", (err) => console.log(err));
    yield exports.redisClientCache.connect();
}))();
