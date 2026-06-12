import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

export const limiter = rateLimit({
    windowMs: 1000 * 60 * 15, //15 mins
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),

    message: {
        error: "Too many requests, please try again later.",
    },
});