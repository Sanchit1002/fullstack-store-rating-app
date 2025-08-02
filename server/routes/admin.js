const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateUserRegistration, validateStoreCreation } = require('../middleware/validation');

const router = express.Router();

// Admin dashboard statistics
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM stores'),
      pool.query('SELECT COUNT(*) as count FROM ratings')
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalStores: parseInt(storesCount.rows[0].count),
        totalRatings: parseInt(ratingsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get all users with filtering and sorting
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = 'SELECT id, name, email, address, role, created_at FROM users';
    const queryParams = [];
    let whereConditions = [];

    if (search) {
      whereConditions.push('(name ILIKE $1 OR email ILIKE $1 OR address ILIKE $1)');
      queryParams.push(`%${search}%`);
    }

    if (role) {
      const paramIndex = queryParams.length + 1;
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Validate sort parameters
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'name';
    }
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sortOrder = 'asc';
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, queryParams);

    res.json({
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details by ID
router.get('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        ...user,
        average_rating: user.role === 'store_owner' ? parseFloat(user.average_rating).toFixed(1) : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (Admin only)
router.post('/users', authenticateToken, requireRole(['admin']), validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address',
      [name, email, passwordHash, address, role]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Admin only)
router.put('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, address = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role, address',
      [name, email, address, role, id]
    );

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all stores with filtering and sorting
router.get('/stores', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [];
    let whereClause = '';

    if (search) {
      whereClause = 'WHERE s.name ILIKE $1 OR s.email ILIKE $1 OR s.address ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    query += whereClause + ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name';

    // Validate sort parameters
    const validSortFields = ['name', 'email', 'address', 'average_rating'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'name';
    }
    if (!validSortOrders.includes(sortOrder.toLowerCase())) {
      sortOrder = 'asc';
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, queryParams);

    res.json({
      stores: result.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }))
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store details by ID
router.get('/stores/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address,
        s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = result.rows[0];
    res.json({
      store: {
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Create new store (Admin only)
router.post('/stores', authenticateToken, requireRole(['admin']), validateStoreCreation, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store already exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (existingStore.rows.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Create store
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id',
      [name, email, address, ownerId || null]
    );

    const store = result.rows[0];

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.owner_id
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update store (Admin only)
router.put('/stores/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );

    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if email is already taken by another store
    const emailCheck = await pool.query(
      'SELECT id FROM stores WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    const result = await pool.query(
      'UPDATE stores SET name = $1, email = $2, address = $3, owner_id = $4 WHERE id = $5 RETURNING id, name, email, address, owner_id',
      [name, email, address, ownerId || null, id]
    );

    res.json({
      message: 'Store updated successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Delete store (Admin only)
router.delete('/stores/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM stores WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

module.exports = router; 