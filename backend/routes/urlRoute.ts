import express from 'express';
import { shortenUrl, getAnalytics } from '../controllers/urlController';
import { addUserToRequest, protect } from '../middlewares/authMiddleware';

const urlRoute = express.Router();

urlRoute.post("/shorten", addUserToRequest, shortenUrl);
urlRoute.get('/stats/:shortId', protect, getAnalytics);

export default urlRoute;
