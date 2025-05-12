import { nanoid } from 'nanoid';
import validator from 'validator';
import { Url } from '../models/url.model.js';
import { logger } from '../utils/logger.js';

export const shortenUrl = async (req, res, next) => {
  try {
    const { longUrl, customCode, expiresAt } = req.body;
    const userId = req.user.id;
    
    // Validate longUrl
    if (!longUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a URL to shorten'
      });
    }
    
    // Check if URL is valid
    if (!validator.isURL(longUrl, { require_protocol: true })) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid URL with protocol (http:// or https://)'
      });
    }
    
    let shortCode = customCode ? customCode.trim() : nanoid(6);
    
    if (customCode) {
      if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
        return res.status(400).json({
          success: false,
          error: 'Custom code can only contain letters and numbers'
        });
      }
      
      // Check if custom code is already in use
      const existingUrl = await Url.findOne({ shortCode });
      if (existingUrl) {
        return res.status(409).json({
          success: false,
          error: 'This custom code is already in use'
        });
      }
    }
    
    // Create URL object
    const url = new Url({
      shortCode,
      longUrl,
      user: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    
    // Validate expiresAt if provided
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid expiration date'
        });
      }
      
      // Ensure expiry date is in the future
      if (expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Expiration date must be in the future'
        });
      }
    }
    
    // Save URL to database
    await url.save();
    
    // Generate shortUrl
    const shortUrl = `${process.env.BASE_URL}/s/${shortCode}`;
    
    // Return response
    res.status(201).json({
      success: true,
      data: {
        id: url._id,
        shortCode,
        shortUrl,
        longUrl,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt
      }
    });
    
    logger.info(`URL shortened: ${shortCode} -> ${longUrl} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};

export const getMyUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find all URLs for user
    const urls = await Url.find({ user: userId })
      .sort({ createdAt: -1 });
    
    // Format response data
    const formattedUrls = urls.map(url => ({
      id: url._id,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/s/${url.shortCode}`,
      longUrl: url.longUrl,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt
    }));
    
    // Return response
    res.status(200).json({
      success: true,
      count: urls.length,
      data: formattedUrls
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.id;
    
    // Find URL
    const url = await Url.findOne({ shortCode });
    
    // Check if URL exists
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found'
      });
    }
    
    // Check if user owns the URL
    if (url.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this URL stats'
      });
    }
    
    // Return stats
    res.status(200).json({
      success: true,
      data: {
        id: url._id,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/s/${url.shortCode}`,
        longUrl: url.longUrl,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        isExpired: url.expiresAt && url.expiresAt < new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.id;
    
    // Find URL
    const url = await Url.findOne({ shortCode });
    
    // Check if URL exists
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found'
      });
    }
    
    // Check if user owns the URL
    if (url.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this URL'
      });
    }
    
    // Delete URL
    await url.deleteOne();
    
    // Return response
    res.status(200).json({
      success: true,
      data: {}
    });
    
    logger.info(`URL deleted: ${shortCode} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};