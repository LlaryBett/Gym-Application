import pool from '../database/db.js';

class MembershipPlan {
    // ==================== GET PLANS ====================
    
    // Get all active plans (public)
    static async findAll(status = 'active') {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE status = $1
            ORDER BY display_order, price_monthly
        `;
        
        const result = await pool.query(query, [status]);
        return result.rows;
    }

    // ==================== NEW METHOD: Get ALL plans (including inactive) for admin ====================
    static async findAllWithInactive() {
        const query = `
            SELECT * FROM public.membership_plans
            WHERE status IN ('active', 'inactive', 'archived')
            ORDER BY 
                CASE 
                    WHEN status = 'active' THEN 1
                    WHEN status = 'inactive' THEN 2
                    ELSE 3
                END,
                display_order, 
                price_monthly
        `;
        
        const result = await pool.query(query);
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
    
    // Create new plan (admin) - UPDATED with new fields
    static async create(planData) {
        const {
            name,
            description,
            price_monthly,
            price_yearly,
            highlighted = false,
            features = [],
            display_order = 0,
            popular = false,
            max_members = null,
            cancel_anytime = true,
            trial_days = 0
        } = planData;

        const query = `
            INSERT INTO public.membership_plans (
                name, description, price_monthly, price_yearly, 
                highlighted, features, display_order, status,
                popular, max_members, cancel_anytime, trial_days
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            name, description, price_monthly, price_yearly,
            highlighted, JSON.stringify(features), display_order,
            popular, max_members, cancel_anytime, trial_days
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update plan (admin) - UPDATED with new fields
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
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
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

    // ==================== OPTIONAL: Get plan statistics ====================
    static async getStats() {
        const [
            totalResult,
            activeResult,
            featuredResult
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM public.membership_plans WHERE status != 'deleted'`),
            pool.query(`SELECT COUNT(*) FROM public.membership_plans WHERE status = 'active'`),
            pool.query(`SELECT COUNT(*) FROM public.membership_plans WHERE highlighted = true AND status = 'active'`)
        ]);

        return {
            total: parseInt(totalResult.rows[0].count),
            active: parseInt(activeResult.rows[0].count),
            featured: parseInt(featuredResult.rows[0].count)
        };
    }
}

export default MembershipPlan;