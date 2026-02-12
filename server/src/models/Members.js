import pool from '../database/db.js';

class Member {
  // Create new member - UPDATED to accept EXACT frontend payload
  static async create(memberData) {
    // Extract data from frontend (EXACTLY what you're sending)
    const {
      first_name,          // You're sending 'first_name'
      last_name,           // You're sending 'last_name'
      email,
      cell_phone,          // You're sending 'cell_phone'
      gender = '',
      date_of_birth = null,
      emergency_contact_name = '',
      emergency_contact_phone = '',
      emergency_contact_email = '',
      emergency_contact_relationship = '',
      inquiry = '',
      hear_about_us = '',   // You're sending 'hear_about_us'
      membership_type = 'standard',
      // Optional fields with defaults
      address = '',
      city = '',
      state = '',
      zip_code = '',
      country = ''
    } = memberData;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate membership number
      const membershipNumberResult = await client.query(
        "SELECT public.generate_membership_number() as membership_number"
      );
      const membershipNumber = membershipNumberResult.rows[0].membership_number;
      
      // Insert member - using EXACT field names from frontend
      const query = `
        INSERT INTO public.members (
          membership_number,
          first_name,
          last_name,
          email,
          cell_phone,
          gender,
          date_of_birth,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_email,
          emergency_contact_relationship,
          inquiry,
          hear_about_us,
          membership_type,
          address,
          city,
          state,
          zip_code,
          country,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'pending')
        RETURNING *
      `;
      
      const values = [
        membershipNumber,
        first_name || '',
        last_name || '',
        email,
        cell_phone || '',
        gender,
        date_of_birth || null,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_email,
        emergency_contact_relationship,
        inquiry,
        hear_about_us,
        membership_type,
        address,
        city,
        state,
        zip_code,
        country
      ];
      
      console.log('Creating member with values:', values); // Debug log
      
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error); // Debug log
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all members with pagination - KEEP AS IS
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM public.members';
    let conditions = [];
    let values = [];
    let paramCount = 1;

    // Apply filters
    if (filters.status) {
      conditions.push(`status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        membership_number ILIKE $${paramCount}
      )`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM public.members';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));
    
    return {
      members: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  // Get member by ID - KEEP AS IS
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM public.members WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get member by email - KEEP AS IS
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM public.members WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // ADDED: Find one member with multiple criteria (for login)
  static async findOne(criteria) {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    if (conditions.length === 0) {
      throw new Error('No criteria provided for findOne');
    }

    const query = `
      SELECT * FROM public.members 
      WHERE ${conditions.join(' AND ')}
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update member - UPDATED to handle EXACT field names
  static async update(id, memberData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Handle special field transformations if needed
    const transformedData = { ...memberData };
    
    // If frontend sends 'phone', map to 'cell_phone'
    if (transformedData.phone !== undefined) {
      transformedData.cell_phone = transformedData.phone;
      delete transformedData.phone;
    }
    
    // If frontend sends 'referral_source', map to 'hear_about_us'
    if (transformedData.referral_source !== undefined) {
      transformedData.hear_about_us = transformedData.referral_source;
      delete transformedData.referral_source;
    }
    
    // If frontend sends 'name', split into 'first_name' and 'last_name'
    if (transformedData.name !== undefined) {
      const nameParts = transformedData.name.trim().split(' ');
      transformedData.first_name = nameParts[0] || '';
      transformedData.last_name = nameParts.slice(1).join(' ') || '';
      delete transformedData.name;
    }

    for (const [key, value] of Object.entries(transformedData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE public.members 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete member - KEEP AS IS
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM public.members WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Count members by status - KEEP AS IS
  static async countByStatus() {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM public.members 
      GROUP BY status 
      ORDER BY status
    `);
    return result.rows;
  }

  // Get recent members - KEEP AS IS
  static async getRecent(limit = 5) {
    const result = await pool.query(
      `SELECT * FROM public.members 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export default Member;