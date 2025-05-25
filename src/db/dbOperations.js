import { db } from './config';

// Patient Operations
export const addPatient = async (name, age, gender, medicalHistory) => {
  try {
    const result = await db.query(
      'INSERT INTO patients (name, age, gender, medical_history) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, age, gender, medicalHistory]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const getPatients = async () => {
  try {
    const result = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

export const getPatientById = async (id) => {
  try {
    const result = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, updates) => {
  const { name, age, gender, medical_history } = updates;
  try {
    const result = await db.query(
      'UPDATE patients SET name = $1, age = $2, gender = $3, medical_history = $4 WHERE id = $5 RETURNING *',
      [name, age, gender, medical_history, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Appointment Operations
export const addAppointment = async (patientId, appointmentDate, reason) => {
  try {
    const result = await db.query(
      'INSERT INTO appointments (patient_id, appointment_date, reason) VALUES ($1, $2, $3) RETURNING *',
      [patientId, appointmentDate, reason]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const result = await db.query(`
      SELECT 
        a.*,
        p.name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY appointment_date ASC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const result = await db.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}; 