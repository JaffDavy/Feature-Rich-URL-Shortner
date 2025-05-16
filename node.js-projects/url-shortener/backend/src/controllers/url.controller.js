import { nanoid } from 'nanoid';
import validator from 'validator';
import { createShortUrl, findUrlByShortCode, findUrlsByUserId, deleteUrlById  } from '../models/url.model.js';
import { logger } from '../utils/logger.js';

export const shortenUrl = async (req, res, next) => {
  try {
    const { longUrl, customCode, expiresAt } = req.body;
    const userId = req.user.id;

    if (!longUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a URL to shorten',
      });
    }

    if (!validator.isURL(longUrl, { require_protocol: true })) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid URL with protocol (http:// or https://)',
      });
    }

    let shortCode = customCode ? customCode.trim() : nanoid(6);

    if (customCode) {
      if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
        return res.status(400).json({
          success: false,
          error: 'Custom code can only contain letters and numbers',
        });
      }

      const existingUrl = await findUrlByShortCode(shortCode);
      if (existingUrl) {
        return res.status(409).json({
          success: false,
          error: 'This custom code is already in use',
        });
      }
    }

    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or past expiration date',
        });
      }
    }

    const newUrl = await createShortUrl({
      shortCode,
      longUrl,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    const shortUrl = `${process.env.BASE_URL}/s/${shortCode}`;

    res.status(201).json({
      success: true,
      data: {
        id: newUrl.id,
        shortCode,
        shortUrl,
        longUrl,
        expiresAt: newUrl.expires_at,
        createdAt: newUrl.created_at,
      },
    });

    logger.info(`URL shortened: ${shortCode} -> ${longUrl} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};

export const getMyUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const urls = await findUrlsByUserId(userId);

    const formattedUrls = urls.map(url => ({
      id: url.id,
      shortCode: url.shortcode,
      shortUrl: `${process.env.BASE_URL}/s/${url.shortcode}`,
      longUrl: url.long_url,
      clicks: url.clicks,
      expiresAt: url.expires_at,
      createdAt: url.created_at,
    }));

    res.status(200).json({
      success: true,
      count: urls.length,
      data: formattedUrls,
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const url = await findUrlByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    if (url.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this URL stats',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: url.id,
        shortCode: url.shortcode,
        shortUrl: `${process.env.BASE_URL}/s/${url.shortcode}`,
        longUrl: url.long_url,
        clicks: url.clicks,
        expiresAt: url.expires_at,
        createdAt: url.created_at,
        isExpired: url.expires_at && new Date(url.expires_at) < new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const url = await findUrlByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    if (url.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this URL',
      });
    }

    await deleteUrlById(url.id);

    res.status(200).json({
      success: true,
      data: {},
    });

    logger.info(`URL deleted: ${shortCode} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};