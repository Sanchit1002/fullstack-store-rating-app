const bcrypt = require('bcryptjs');
const pool = require('./server/config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'stores', 'ratings')
    `);
    
    if (tablesResult.rows.length === 3) {
      console.log('✅ Database tables already exist');
    } else {
      console.log('❌ Database tables not found. Please run the schema.sql file first.');
      console.log('Run: psql -d your_database_name -f server/config/schema.sql');
      process.exit(1);
    }
    
    // Check if admin user exists
    const adminCheck = await client.query('SELECT id FROM users WHERE role = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      console.log('Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await client.query(`
        INSERT INTO users (name, email, password_hash, address, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'System Administrator',
        'admin@store-ratings.com',
        hashedPassword,
        '123 Admin Street, Admin City, AC 12345',
        'admin'
      ]);
      
      console.log('✅ Default admin user created');
      console.log('Email: admin@store-ratings.com');
      console.log('Password: Admin@123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    client.release();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run server');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('3. Login with admin credentials');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 