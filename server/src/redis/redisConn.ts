import {createClient} from "redis";

export const redisClientCache = createClient();

(async () => {
	redisClientCache.on("connect", () => console.log("redis cache connected"));
	redisClientCache.on("error", (err) => console.log(err));
	await redisClientCache.connect();
})();
