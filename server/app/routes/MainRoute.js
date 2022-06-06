"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const UserRoutes_1 = __importDefault(require("./UserRoutes"));
const StockRoutes_1 = __importDefault(require("./StockRoutes"));
router.use("/user", UserRoutes_1.default);
router.use("/stock", StockRoutes_1.default);
const MainRoute = router;
exports.default = MainRoute;
