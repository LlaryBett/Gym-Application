import pool from '../database/db.js';

class MembershipPlan {
    // ==================== GET PLANS ====================
    
    // Get all active plans
    static async findAll(status = 'active') {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE status = $1
            ORDER BY display_order, price_monthly
        `;
        
        const result = await pool.query(query, [status]);
        return result.rows;
    }

    // Get plan by ID
    static async findById(id) {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE id = $1 AND status != 'deleted'
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get plan by name
    static async findByName(name) {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE name = $1 AND status != 'deleted'
        `;
        
        const result = await pool.query(query, [name]);
        return result.rows[0];
    }

    // Get highlighted plan
    static async getHighlighted() {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE highlighted = true AND status = 'active'
            LIMIT 1
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    }

    // ==================== ADMIN: MANAGE PLANS ====================
    
    // Create new plan (admin)
    static async create(planData) {
        const {
            name,
            description,
            price_monthly,
            price_yearly,
            highlighted = false,
            features = [],
            display_order = 0
        } = planData;

        const query = `
            INSERT INTO public.membership_plans (
                name, description, price_monthly, price_yearly, 
                highlighted, features, display_order, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
            RETURNING *
        `;

        const values = [
            name, description, price_monthly, price_yearly,
            highlighted, JSON.stringify(features), display_order
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update plan (admin)
    static async update(id, planData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(planData)) {
            if (value !== undefined) {
                if (key === 'features') {
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

        values.push(id);
        const query = `
            UPDATE public.membership_plans
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete plan (soft delete - admin)
    static async delete(id) {
        const result = await pool.query(
            `UPDATE public.membership_plans
             SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}

export default MembershipPlan;