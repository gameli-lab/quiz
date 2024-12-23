const Redis = require("ioredis");
require("dotenv").config();

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    // Retry connection with exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Handle Redis connection events
redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Utility functions for caching
const redisUtils = {
  /**
   * Set a key-value pair with optional expiration
   * @param {string} key
   * @param {string} value
   * @param {number} expireSeconds
   */
  async set(key, value, expireSeconds = null) {
    try {
      if (expireSeconds) {
        await redis.setex(key, expireSeconds, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Redis SET error:", error);
      throw error;
    }
  },

  /**
   * Get value by key
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis GET error:", error);
      throw error;
    }
  },

  /**
   * Delete a key
   * @param {string} key
   */
  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
      throw error;
    }
  },

  /**
   * Clear all keys
   */
  async clear() {
    try {
      await redis.flushall();
    } catch (error) {
      console.error("Redis CLEAR error:", error);
      throw error;
    }
  },

  /**
   * Check if key exists
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      return await redis.exists(key);
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      throw error;
    }
  },
};

module.exports = redisUtils;
