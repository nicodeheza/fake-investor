import {createClient} from "redis";

export const redisClientCache = createClient();

// export const redisConnect = async () => {
// 	redisClient.on("error", (err) => console.log(err));
// 	await redisClient.connect();
// 	// redisClient.on("connect", () => console.log("redis connected"));
// };

(async () => {
	redisClientCache.on("connect", () => console.log("redis cache connected"));
	redisClientCache.on("error", (err) => console.log(err));
	await redisClientCache.connect();
})();
