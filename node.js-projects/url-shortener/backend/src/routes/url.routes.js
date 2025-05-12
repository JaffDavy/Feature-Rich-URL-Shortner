import express from 'express';
import { 
  shortenUrl, 
  getMyUrls, 
  getUrlStats,
  deleteUrl
} from '../controllers/url.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Shorten a URL
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 format: uri
 *               customCode:
 *                 type: string
 *                 description: Custom short code (optional)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date/time (optional)
 *     responses:
 *       201:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Custom code already in use
 *       401:
 *         description: Not authorized
 */
router.post('/shorten', protect, shortenUrl);

/**
 * @swagger
 * /api/my-urls:
 *   get:
 *     summary: Get all URLs for current user
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's URLs
 *       401:
 *         description: Not authorized
 */
router.get('/my-urls', protect, getMyUrls);

/**
 * @swagger
 * /api/url/{shortCode}/stats:
 *   get:
 *     summary: Get URL stats
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL stats
 *       404:
 *         description: URL not found
 *       403:
 *         description: Not authorized to access this URL stats
 */
router.get('/url/:shortCode/stats', protect, getUrlStats);

/**
 * @swagger
 * /api/url/{shortCode}:
 *   delete:
 *     summary: Delete a URL
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL deleted
 *       404:
 *         description: URL not found
 *       403:
 *         description: Not authorized to delete this URL
 */
router.delete('/url/:shortCode', protect, deleteUrl);

export default router;