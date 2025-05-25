import { PGlite } from '@electric-sql/pglite';

// Initialize PGlite with IndexedDB persistence
let db;
try {
  db = new PGlite('idb://patient-app-db');
} catch (error) {
  console.error('Error initializing PGlite:', error);
  throw error;
}

// Initialize the database schema
const initializeDatabase = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        appointment_date TIMESTAMP NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Verify the table was created
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE tablename = 'patients'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      throw new Error('Failed to create patients table');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize the database and export a promise that resolves when initialization is complete
export const dbInitPromise = initializeDatabase();

// Export the database instance
export { db }; 