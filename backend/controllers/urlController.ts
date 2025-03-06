import expressAsyncHandler from "express-async-handler";
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

    res.status(200).json({ message: "Analytics fetched successfully", data: url });
});