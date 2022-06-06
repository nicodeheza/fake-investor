import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import {createClient} from "redis";
import connectRedis from "connect-redis";
import createTables from "./db/tables";
import passportConfig from "./middelwares/passaportConfig";

const RedisStore = connectRedis(session);

const app = express();
export default app;

app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true
	})
);

createTables();

import MainRoute from "./routes/MainRoute";

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const redisClient = createClient(
	process.env.NODE_ENV === "production"
		? {legacyMode: true, url: process.env.REDIS_URL}
		: {legacyMode: true}
);
redisClient.connect().catch(console.error);
app.use(
	session({
		secret: process.env.SECRET || "secret",
		resave: false,
		saveUninitialized: false,
		store: new RedisStore({client: redisClient})
	})
);
app.use(cookieParser(process.env.SECRET));

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", MainRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`app listen in port ${PORT}`);
});
