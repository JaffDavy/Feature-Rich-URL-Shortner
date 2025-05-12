import express from 'express';
import { redirectUrl } from '../controllers/redirect.controller.js';

const router = express.Router();

/**
 * @swagger
 * /s/{shortCode}:
 *   get:
 *     summary: Redirect to original URL
 *     tags: [Redirect]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to original URL
 *       404:
 *         description: URL not found
 *       410:
 *         description: URL has expired
 */
router.get('/:shortCode', redirectUrl);

export default router;