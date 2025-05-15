import { findUrlByShortCode, incrementClick } from '../models/url.model.js';
import { logger } from '../utils/logger.js';

export const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await findUrlByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found'
      });
    }

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'URL has expired'
      });
    }

    await incrementClick(url.id);

    logger.info(`Redirecting: ${shortCode} -> ${url.long_url} (${url.clicks + 1} clicks)`);

    return res.redirect(url.long_url);
  } catch (error) {
    next(error);
  }
};
