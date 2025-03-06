import expressAsyncHandler from "express-async-handler";
import { Request } from "express-serve-static-core";
import analyticsModel from "../models/analyticsModel";
import urlModel from "../models/urlModel";
import { urlSchema } from "../utils/validation";
import { generateShortId } from "../utils/types";
import redisClient from "../config/redis";

// @docs: shorten a URL
// @route: POST /api/url/shorten
// @access: public
export const shortenUrl = expressAsyncHandler(async (req, res) => {
    const body = req.body;

    // if user is logged in, link the short URL to the user
    if (body.user) body.ownerId = body.user.id;

    const validate = urlSchema.safeParse(body);
    if (!validate.success) {
        const errMsg = validate.error.issues[0].message;
        res.status(400).json({ error: errMsg == "Required" ? `${validate.error.issues[0].path} is ${errMsg.toLocaleLowerCase()}` : errMsg });
        return;
    }

    // check if the URL already exists
    const isUrlExists = await urlModel.findOne({ url: validate.data.url });
    if (isUrlExists) {
        res.status(400).json({ message: "This URL is already shortened", shortUrl: `${process.env.BASE_URL}/${isUrlExists.shortId}` });
        return;
    }

    // generate a unique shortId for the URL
    let shortIds;
    do {
        shortIds = generateShortId();
    } while (await urlModel.findOne({ shortId: shortIds }));
    validate.data.shortId = shortIds;

    // create a new short URL
    const shortId = await urlModel.create(validate.data);
    await shortId.save();

    res.status(201).json({ message: "URL shortened successfully", shortUrl: `${process.env.BASE_URL}/${shortId.shortId}` });

});

// @docs: redirect to the original URL
// @route: GET /:shortId
// @access: public
export const redirectToUrl = expressAsyncHandler(async (req, res) => {
    const shortId = req.params.shortId;

    // check if the short URL is in the cache
    const checkCache = await redisClient.get(shortId);
    if (checkCache) {
        console.log('Cache Hit');

        // 
        logAnalytics(req, shortId);
        res.redirect(checkCache);
        return;
    }

    // find the original URL from the database
    const url = await urlModel.findOne({ shortId });
    if (!url) {
        res.status(404).json({ error: "URL not found" });
        return;
    }

    // set the short URL in the cache
    await redisClient.set(shortId, url.url);

    // 
    await logAnalytics(req, shortId)

    // increment the click count
    url.clicks++;
    await url.save();

    res.redirect(url.url);
});

// @docs: Analytics for a short URL
// @route: GET /api/url/stats/:shortId
// @access: public
export const getAnalytics = expressAsyncHandler(async (req, res) => {
    const { shortId } = req.params;
    const { user, ...body } = req.body;
    body.shortId = shortId;
    body.ownerId = user.id;

    const validate = urlSchema.pick({ shortId: true, ownerId: true }).safeParse(body);
    if (!validate.success) {
        const errMsg = validate.error.issues[0].message;
        res.status(400).json({ error: errMsg == "Required" ? `${validate.error.issues[0].path} is ${errMsg.toLocaleLowerCase()}` : errMsg });
        return;
    }

    // find the original URL
    const url = await urlModel.findOne({ $and: [{ shortId }, { ownerId: validate.data.ownerId }] });
    if (!url) {
        res.status(404).json({ error: "URL not found" });
        return;
    }

    const analytics = await analyticsModel.find({ shortId: url._id });

    if (!analytics.length) {
        res.status(404).json({ message: "No analytics data found for this URL" })
    }

    // count top referrer
    const referrerCounts: Record<string, number> = {};
    analytics.forEach((entry) => {
        const referrer = entry.referrer || "Direct";
        referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });

    // Count top devices
    const deviceCounts: Record<string, number> = {};
    analytics.forEach((entry) => {
        const device = entry.userAgent || "Unknown";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });


    res.status(200).json({ shortId, totalClicks: url.clicks, topReferrers: referrerCounts, topDevices: deviceCounts, visitsOverTime: analytics.map(entry => entry.timestamp) });
});

// @docs: Log analytics for a short URL
const logAnalytics = async (req: Request, shortId: string) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referrer = req.get('Referrer') || 'Direct';
    const location = req.headers['location'] || 'Unknown';

    const urlId = await urlModel.findOne({ shortId });
    if (urlId) {
        await analyticsModel.create({ shortId: urlId._id, ip, userAgent, referrer, location, timestamp: new Date() });
    }
};
