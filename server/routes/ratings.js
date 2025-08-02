const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

const router = express.Router();

// Submit or update rating for a store
router.post('/:storeId', authenticateToken, validateRating, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, userId, storeId]
      );

      res.json({ 
        message: 'Rating updated successfully',
        rating: rating
      });
    } else {
      // Create new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [userId, storeId, rating]
      );

      res.status(201).json({ 
        message: 'Rating submitted successfully',
        rating: rating
      });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get user's rating for a specific store
router.get('/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    res.json({
      rating: result.rows.length > 0 ? result.rows[0].rating : null
    });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Failed to get rating' });
  }
});

// Get all ratings for a store (Store Owner only)
router.get('/store/:storeId', authenticateToken, requireRole(['store_owner', 'admin']), async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // If user is store owner, verify they own this store
    if (req.user.role === 'store_owner') {
      const storeResult = await pool.query(
        'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
        [storeId, userId]
      );

      if (storeResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json({
      ratings: result.rows
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Failed to get store ratings' });
  }
});

// Get store statistics (Store Owner only)
router.get('/store/:storeId/stats', authenticateToken, requireRole(['store_owner', 'admin']), async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // If user is store owner, verify they own this store
    if (req.user.role === 'store_owner') {
      const storeResult = await pool.query(
        'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
        [storeId, userId]
      );

      if (storeResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(`
      SELECT 
        COUNT(r.id) as total_ratings,
        COALESCE(AVG(r.rating), 0) as average_rating,
        MIN(r.rating) as min_rating,
        MAX(r.rating) as max_rating,
        COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
      FROM ratings r
      WHERE r.store_id = $1
    `, [storeId]);

    const stats = result.rows[0];
    res.json({
      stats: {
        total_ratings: parseInt(stats.total_ratings),
        average_rating: parseFloat(stats.average_rating).toFixed(1),
        min_rating: parseInt(stats.min_rating) || 0,
        max_rating: parseInt(stats.max_rating) || 0,
        rating_distribution: {
          five_star: parseInt(stats.five_star),
          four_star: parseInt(stats.four_star),
          three_star: parseInt(stats.three_star),
          two_star: parseInt(stats.two_star),
          one_star: parseInt(stats.one_star)
        }
      }
    });
  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({ error: 'Failed to get store statistics' });
  }
});

// Delete rating (Admin only)
router.delete('/:storeId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.body;

    const result = await pool.query(
      'DELETE FROM ratings WHERE store_id = $1 AND user_id = $2 RETURNING id',
      [storeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

module.exports = router; 