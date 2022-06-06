import "dotenv/config";
import {createClient} from "redis";

export const redisClientCache = createClient(
	process.env.NODE_ENV === "production" ? {url: process.env.REDIS_URL} : {}
);

(async () => {
	redisClientCache.on("connect", () => console.log("redis cache connected"));
	redisClientCache.on("error", (err) => console.log(err));
	await redisClientCache.connect();
})();
