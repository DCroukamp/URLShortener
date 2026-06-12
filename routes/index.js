import express from 'express';
import db from '../config/db.js';
import redis from '../config/redis.js';
import { limiter } from "../middleware/rateLimiter.js";
import { createShortenedURL, getOriginalUrl } from '../services/urlService.js';


const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'URL Shortener' });
});


router.post('/shorten', async function (req, res, next) {
  try {
    const { url } = req.body;

    const code = await createShortenedURL(db, url);

    res.render("index", {
      shortUrl: `http://localhost:3000/${code}`
    });
  } catch (e) {
    console.log("/SHORTEN ERROR: " + e);
    res.status(500).send("Server Error creating short URL");
  }
});


router.get('/:code([a-zA-Z0-9_-]{7})', limiter, async function (req, res) {
  try {
    const {code} = req.params;

    const record = await getOriginalUrl(db, redis, code);

    if (!record) {
      return res.status(404).send("URL not found");
    }
    return res.redirect(record);

  } catch (e) {
    console.log("/CODE ERROR: " + e);
    res.status(500).send("Server Error retrieving URL");
  }
});

export default router;
