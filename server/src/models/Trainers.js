import pool from '../database/db.js';

class Trainers {
  // Create new trainer
  static async create(trainerData) {
    const {
      name,
      specialty,
      image = '',
      bio = '',
      certifications = [],
      email,
      phone = '',
      socials = {},
      featured = false,
      size = 'regular',
      status = 'active'
    } = trainerData;

    const query = `
      INSERT INTO public.trainers (
        name, specialty, image, bio, certifications, email, 
        phone, socials, featured, size, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      name,
      specialty,
      image,
      bio,
      certifications,
      email,
      phone,
      JSON.stringify(socials),
      featured,
      size,
      status
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all trainers with optional filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM public.trainers WHERE status != $1';
    let conditions = ['deleted'];
    let values = ['deleted'];
    let paramCount = 2;

    // Apply filters
    if (filters.specialty) {
      conditions.push(`specialty = $${paramCount}`);
      values.push(filters.specialty);
      paramCount++;
    }

    if (filters.featured !== undefined) {
      conditions.push(`featured = $${paramCount}`);
      values.push(filters.featured);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        name ILIKE $${paramCount} OR 
        specialty ILIKE $${paramCount} OR 
        bio ILIKE $${paramCount}
      )`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (conditions.length > 1) {
      query += ' AND ' + conditions.slice(1).join(' AND ');
    }

    // Add pagination
    query += ` ORDER BY featured DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM public.trainers WHERE status != $1';
    if (conditions.length > 1) {
      countQuery += ' AND ' + conditions.slice(1).join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));
    
    return {
      trainers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  // Get trainer by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM public.trainers WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );
    return result.rows[0];
  }

  // Get trainer by email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM public.trainers WHERE email = $1 AND status != $2',
      [email, 'deleted']
    );
    return result.rows[0];
  }

  // Update trainer
  static async update(id, trainerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(trainerData)) {
      if (value !== undefined) {
        if (key === 'socials') {
          fields.push(`${key} = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE public.trainers 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND status != $${paramCount + 1}
      RETURNING *
    `;
    
    values.push('deleted');

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete trainer (soft delete)
  static async delete(id) {
    const result = await pool.query(
      `UPDATE public.trainers 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Get featured trainers
  static async getFeatured(limit = 6) {
    const result = await pool.query(
      `SELECT * FROM public.trainers 
       WHERE featured = true AND status != 'deleted'
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Get trainers by specialty
  static async findBySpecialty(specialty) {
    const result = await pool.query(
      `SELECT * FROM public.trainers 
       WHERE specialty = $1 AND status != 'deleted'
       ORDER BY name`,
      [specialty]
    );
    return result.rows;
  }

  // Get available specialties
  static async getSpecialties() {
    const result = await pool.query(`
      SELECT DISTINCT specialty 
      FROM public.trainers 
      WHERE status != 'deleted'
      ORDER BY specialty
    `);
    return result.rows.map(row => row.specialty);
  }

  // Get trainer statistics
  static async getStats() {
    const [totalResult, featuredResult, specialtiesResult] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM public.trainers WHERE status != 'deleted'"),
      pool.query("SELECT COUNT(*) FROM public.trainers WHERE featured = true AND status != 'deleted'"),
      pool.query("SELECT specialty, COUNT(*) as count FROM public.trainers WHERE status != 'deleted' GROUP BY specialty ORDER BY count DESC")
    ]);

    return {
      total: parseInt(totalResult.rows[0].count),
      featured: parseInt(featuredResult.rows[0].count),
      specialties: specialtiesResult.rows
    };
  }
}

export default Trainers;