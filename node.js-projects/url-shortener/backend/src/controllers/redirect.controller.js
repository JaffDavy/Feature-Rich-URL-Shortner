import { Url } from '../models/url.model.js';
import { logger } from '../utils/logger.js';

export const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Find URL
    const url = await Url.findOne({ shortCode });
    
    // Check if URL exists
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found'
      });
    }
    
    // Check if URL has expired
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'URL has expired'
      });
    }
    
    // Increment clicks count
    url.clicks += 1;
    await url.save();
    
    // Log redirection
    logger.info(`Redirecting: ${shortCode} -> ${url.longUrl} (${url.clicks} clicks)`);
    
    // Redirect to original URL
    return res.redirect(url.longUrl);
  } catch (error) {
    next(error);
  }
};