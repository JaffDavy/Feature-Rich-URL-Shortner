import pool from '../config/db.js';

export const createShortUrl = async ({ shortCode, longUrl, userId, expiresAt }) => {
  const result = await pool.query(
    `INSERT INTO urls (shortcode, long_url, user_id, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
    [shortCode, longUrl, userId, expiresAt]
  );
  return result.rows[0];
};

export const findUrlByShortCode = async (shortCode) => {
  const result = await pool.query(`SELECT * FROM urls WHERE shortcode = $1`, [shortCode]);
  return result.rows[0];
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

export const incrementClick = async (id) => {
  await pool.query(`UPDATE urls SET clicks = clicks + 1 WHERE id = $1`, [id]);
};

export const findUrlsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const deleteUrlById = async (id) => {
  await pool.query(`DELETE FROM urls WHERE id = $1`, [id]);
};
