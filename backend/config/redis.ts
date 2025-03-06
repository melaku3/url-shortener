import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (error) => console.log(`Redis Client Error: ${error}`));

(async () => {
    await redisClient.connect()
        .then(() => console.log("Connected to Redis"))
})();

export default redisClient;
