"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
require("dotenv/config");
const db = mysql2_1.default.createConnection({
    host: "127.0.0.1",
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.NODE_ENV === "test" ? "fakeInversorTest" : "fakeInversor",
    port: 3307
});
exports.default = db;
