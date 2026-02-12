import pool from '../database/db.js';

class Service {
  // ==================== SERVICES CRUD ====================
  
  // Get all services with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM public.services WHERE status != $1';
    let conditions = ['deleted'];
    let values = ['deleted'];
    let paramCount = 2;

    // Apply filters
    if (filters.category) {
      conditions.push(`category = $${paramCount}`);
      values.push(filters.category);
      paramCount++;
    }

    if (filters.featured !== undefined) {
      conditions.push(`featured = $${paramCount}`);
      values.push(filters.featured === 'true' || filters.featured === true);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        title ILIKE $${paramCount} OR 
        description ILIKE $${paramCount}
      )`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (conditions.length > 1) {
      query += ' AND ' + conditions.slice(1).join(' AND ');
    }

    // Add ordering and pagination
    query += ` ORDER BY featured DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM public.services WHERE status != $1';
    if (conditions.length > 1) {
      countQuery += ' AND ' + conditions.slice(1).join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));
    
    return {
      services: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  // Get service by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM public.services WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );
    return result.rows[0];
  }

  // Get featured services
  static async getFeatured(limit = 4) {
    const result = await pool.query(
      `SELECT * FROM public.services 
       WHERE featured = true AND status != 'deleted'
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Create new service
  static async create(serviceData) {
    const {
      title,
      image,
      description = '',
      category,
      featured = false
    } = serviceData;

    const query = `
      INSERT INTO public.services (
        title, image, description, category, featured, status
      ) VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;

    const values = [title, image, description, category, featured];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update service
  static async update(id, serviceData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(serviceData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE public.services 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND status != $${paramCount + 1}
      RETURNING *
    `;
    
    values.push('deleted');

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete service (soft delete)
  static async delete(id) {
    const result = await pool.query(
      `UPDATE public.services 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Get services by category
  static async findByCategory(category) {
    const result = await pool.query(
      `SELECT * FROM public.services 
       WHERE category = $1 AND status != 'deleted'
       ORDER BY featured DESC, created_at DESC`,
      [category]
    );
    return result.rows;
  }

  // Get all categories with service counts
  static async getCategories() {
    const result = await pool.query(`
      SELECT 
        category as name,
        COUNT(*) as service_count,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_count
      FROM public.services 
      WHERE status != 'deleted'
      GROUP BY category
      ORDER BY category
    `);
    return result.rows;
  }

  // ==================== SERVICE CATEGORIES ====================

  // Get all service categories with their items
  static async getAllServiceCategories() {
    const query = `
      SELECT 
        c.id,
        c.name as category,
        c.display_order,
        json_agg(
          json_build_object(
            'id', i.id,
            'service', i.service_name,
            'display_order', i.display_order
          ) ORDER BY i.display_order
        ) as services
      FROM public.service_categories c
      LEFT JOIN public.service_category_items i ON c.id = i.category_id AND i.status != 'deleted'
      WHERE c.status != 'deleted'
      GROUP BY c.id, c.name, c.display_order
      ORDER BY c.display_order
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      category: row.category,
      services: (row.services[0]?.id ? row.services : []).map(s => s.service)
    }));
  }

  // Get service category by ID
  static async getServiceCategoryById(id) {
    const query = `
      SELECT 
        c.id,
        c.name as category,
        json_agg(
          json_build_object(
            'id', i.id,
            'service', i.service_name,
            'display_order', i.display_order
          ) ORDER BY i.display_order
        ) as services
      FROM public.service_categories c
      LEFT JOIN public.service_category_items i ON c.id = i.category_id AND i.status != 'deleted'
      WHERE c.id = $1 AND c.status != 'deleted'
      GROUP BY c.id, c.name
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    return {
      id: result.rows[0].id,
      category: result.rows[0].category,
      services: (result.rows[0].services[0]?.id ? result.rows[0].services : []).map(s => s.service)
    };
  }

  // Create service category
  static async createServiceCategory(categoryData) {
    const { name, display_order = 0 } = categoryData;

    const query = `
      INSERT INTO public.service_categories (name, display_order, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `;

    const values = [name, display_order];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update service category
  static async updateServiceCategory(id, categoryData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(categoryData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE public.service_categories 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND status != $${paramCount + 1}
      RETURNING *
    `;
    
    values.push('deleted');

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete service category (soft delete)
  static async deleteServiceCategory(id) {
    const result = await pool.query(
      `UPDATE public.service_categories 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // ==================== SERVICE CATEGORY ITEMS ====================

  // Add service to category
  static async addServiceToCategory(categoryId, serviceName, display_order = 0) {
    const query = `
      INSERT INTO public.service_category_items (category_id, service_name, display_order, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING *
    `;

    const values = [categoryId, serviceName, display_order];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Remove service from category
  static async removeServiceFromCategory(itemId) {
    const result = await pool.query(
      `UPDATE public.service_category_items 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [itemId]
    );
    return result.rows[0];
  }

  // Update service category item
  static async updateServiceCategoryItem(itemId, itemData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(itemData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(itemId);
    
    const query = `
      UPDATE public.service_category_items 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND status != $${paramCount + 1}
      RETURNING *
    `;
    
    values.push('deleted');

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== STATISTICS ====================

  // Get service statistics
  static async getStats() {
    const [totalResult, featuredResult, categoriesResult] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM public.services WHERE status != 'deleted'"),
      pool.query("SELECT COUNT(*) FROM public.services WHERE featured = true AND status != 'deleted'"),
      pool.query(`
        SELECT category, COUNT(*) as count 
        FROM public.services 
        WHERE status != 'deleted' 
        GROUP BY category 
        ORDER BY count DESC
      `)
    ]);

    return {
      total: parseInt(totalResult.rows[0].count),
      featured: parseInt(featuredResult.rows[0].count),
      categories: categoriesResult.rows
    };
  }
}

export default Service;