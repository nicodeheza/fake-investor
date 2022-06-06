"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const redis_1 = require("redis");
const connect_redis_1 = __importDefault(require("connect-redis"));
const tables_1 = __importDefault(require("./db/tables"));
const passaportConfig_1 = __importDefault(require("./middelwares/passaportConfig"));
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const app = (0, express_1.default)();
exports.default = app;
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
(0, tables_1.default)();
const MainRoute_1 = __importDefault(require("./routes/MainRoute"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const redisClient = (0, redis_1.createClient)({ legacyMode: true });
redisClient.connect().catch(console.error);
app.use((0, express_session_1.default)({
    secret: process.env.SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient })
}));
app.use((0, cookie_parser_1.default)(process.env.SECRET));
(0, passaportConfig_1.default)(passport_1.default);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/api", MainRoute_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`app listen in port ${PORT}`);
});
