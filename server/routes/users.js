const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's own stores (for store owners)
router.get('/my-stores', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can view their stores' });
    }

    const result = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address
      ORDER BY s.name
    `, [userId]);

    res.json({
      stores: result.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }))
    });
  } catch (error) {
    console.error('Get my stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get user's ratings
router.get('/my-ratings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id as store_id,
        s.name as store_name,
        s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC
    `, [userId]);

    res.json({
      ratings: result.rows
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.user.id;

    // Validate input
    if (name && (name.length < 20 || name.length > 60)) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters' });
    }

    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must not exceed 400 characters' });
    }

    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex}`);
      queryParams.push(name);
      paramIndex++;
    }

    if (address) {
      updateFields.push(`address = $${paramIndex}`);
      queryParams.push(address);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    queryParams.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, role, address`,
      queryParams
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router; 