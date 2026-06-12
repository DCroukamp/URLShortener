import {nanoid} from 'nanoid';

function generateCode() {
    return nanoid(7);
}

/**
 * Creates Shortened URL and stores this in the database
 *
 * @param db - PostgreSQL database instance
 * @param originalURL - The full URL to shorten
 * @returns {Promise<*|string>} - The generated shortcode
 */
export async function createShortenedURL(db, originalURL) {
    //normalising url
    if (!originalURL.startsWith("http://") && !originalURL.startsWith("https://")) {
        originalURL = "https://" + originalURL;
    }

    //check if url already has a code
    const existing = await db.oneOrNone(
        `SELECT "shortCode"
         FROM "Url"
         WHERE "originalUrl" = $1`,
        [originalURL]
    );

    if (existing) {
        return existing.shortCode;
    }

    const code = generateCode();
    await db.none(
        `INSERT INTO "Url" ("shortCode", "originalUrl")
     VALUES ($1, $2)`,
        [code, originalURL]
    );

    return code;
}


/**
 * Retrieves the original URL from the shortcode
 *
 * @param db - PostgreSQL database instance
 * @param redis - Redis client instance (for caching)
 * @param code - The shortcode
 * @returns {Promise<*>} - The original URL
 */
export async function getOriginalUrl(db, redis, code) {
    const cachedUrl = await redis.get(code);

    if (cachedUrl) {
        console.log(cachedUrl);
        return cachedUrl;
    }

    //fetching from db if not in cache
    const record = await db.oneOrNone(
        `SELECT *
         FROM "Url"
         WHERE "shortCode" = $1`,
        [code]
    );

    //add code & URL to redis cache
    if (record) {
        await redis.set(code, record.originalUrl, {
            EX: 60 * 60 * 24 //expire in 24 hours
        });
    }

    if(record.originalUrl !== null) {
        return record.originalUrl;
    }
    return record;
}

