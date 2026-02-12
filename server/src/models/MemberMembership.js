import pool from '../database/db.js';

class MemberMembership {
    // ==================== PURCHASE MEMBERSHIP ====================
    
    static async purchase(membershipData) {
        const {
            member_id,
            plan_id,
            billing_cycle,
            price_paid,
            start_date = new Date(),
            auto_renew = true
        } = membershipData;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Calculate end date based on billing cycle
            const end_date = new Date(start_date);
            if (billing_cycle === 'monthly') {
                end_date.setMonth(end_date.getMonth() + 1);
            } else {
                end_date.setFullYear(end_date.getFullYear() + 1);
            }

            // Deactivate any existing active memberships
            await client.query(
                `UPDATE public.member_memberships
                 SET status = 'expired', auto_renew = false
                 WHERE member_id = $1 AND status = 'active'`,
                [member_id]
            );

            // Create new membership
            const membershipQuery = `
                INSERT INTO public.member_memberships (
                    member_id, plan_id, billing_cycle, price_paid,
                    start_date, end_date, auto_renew, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
                RETURNING *
            `;

            const membershipValues = [
                member_id, plan_id, billing_cycle, price_paid,
                start_date, end_date, auto_renew
            ];

            const membershipResult = await client.query(membershipQuery, membershipValues);
            const membership = membershipResult.rows[0];

            // Create history entry
            await client.query(
                `INSERT INTO public.membership_history (
                    member_id, membership_id, action, new_plan_id, 
                    new_billing_cycle, amount
                ) VALUES ($1, $2, 'purchased', $3, $4, $5)`,
                [member_id, membership.id, plan_id, billing_cycle, price_paid]
            );

            await client.query('COMMIT');
            return membership;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Purchase membership error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // ==================== GET MEMBERSHIPS ====================
    
    // Get active membership for a member
    static async getActiveByMemberId(memberId) {
        const query = `
            SELECT m.*, p.name as plan_name, p.features, p.price_monthly, p.price_yearly
            FROM public.member_memberships m
            JOIN public.membership_plans p ON m.plan_id = p.id
            WHERE m.member_id = $1 
              AND m.status = 'active'
              AND m.end_date >= CURRENT_DATE
            ORDER BY m.created_at DESC
            LIMIT 1
        `;
        
        const result = await pool.query(query, [memberId]);
        return result.rows[0];
    }

    // Get all memberships for a member (history)
    static async findByMemberId(memberId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT m.*, p.name as plan_name
            FROM public.member_memberships m
            JOIN public.membership_plans p ON m.plan_id = p.id
            WHERE m.member_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [memberId, limit, offset]);
        
        const countQuery = `
            SELECT COUNT(*) FROM public.member_memberships
            WHERE member_id = $1
        `;
        const countResult = await pool.query(countQuery, [memberId]);
        
        return {
            memberships: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        };
    }

    // Get membership by ID
    static async findById(id) {
        const query = `
            SELECT m.*, p.name as plan_name, p.features
            FROM public.member_memberships m
            JOIN public.membership_plans p ON m.plan_id = p.id
            WHERE m.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get all active memberships (admin)
    static async findAllActive(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT m.*, p.name as plan_name,
                   mem.first_name || ' ' || mem.last_name as member_name,
                   mem.email as member_email
            FROM public.member_memberships m
            JOIN public.membership_plans p ON m.plan_id = p.id
            JOIN public.members mem ON m.member_id = mem.id
            WHERE m.status = 'active' AND m.end_date >= CURRENT_DATE
            ORDER BY m.end_date ASC
            LIMIT $1 OFFSET $2
        `;
        
        const result = await pool.query(query, [limit, offset]);
        
        const countQuery = `
            SELECT COUNT(*) FROM public.member_memberships
            WHERE status = 'active' AND end_date >= CURRENT_DATE
        `;
        const countResult = await pool.query(countQuery);
        
        return {
            memberships: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        };
    }

    // ==================== UPDATE MEMBERSHIP ====================
    
    // Cancel membership
    static async cancel(id, memberId, reason = null) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const result = await client.query(
                `UPDATE public.member_memberships
                 SET status = 'cancelled', 
                     auto_renew = false,
                     cancelled_at = CURRENT_TIMESTAMP,
                     cancellation_reason = $1
                 WHERE id = $2 AND member_id = $3
                 RETURNING *`,
                [reason, id, memberId]
            );

            if (result.rows[0]) {
                await client.query(
                    `INSERT INTO public.membership_history (
                        member_id, membership_id, action, notes
                    ) VALUES ($1, $2, 'cancelled', $3)`,
                    [memberId, id, reason]
                );
            }

            await client.query('COMMIT');
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Upgrade/Downgrade plan
    static async changePlan(id, memberId, newPlanId, newBillingCycle, pricePaid) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get current membership
            const current = await client.query(
                'SELECT plan_id, billing_cycle FROM public.member_memberships WHERE id = $1',
                [id]
            );

            // Update membership
            const result = await client.query(
                `UPDATE public.member_memberships
                 SET plan_id = $1, billing_cycle = $2, price_paid = $3,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4 AND member_id = $5
                 RETURNING *`,
                [newPlanId, newBillingCycle, pricePaid, id, memberId]
            );

            if (result.rows[0]) {
                const action = current.rows[0].plan_id < newPlanId ? 'upgraded' : 'downgraded';
                
                await client.query(
                    `INSERT INTO public.membership_history (
                        member_id, membership_id, action,
                        previous_plan_id, new_plan_id,
                        previous_billing_cycle, new_billing_cycle,
                        amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        memberId, id, action,
                        current.rows[0].plan_id, newPlanId,
                        current.rows[0].billing_cycle, newBillingCycle,
                        pricePaid
                    ]
                );
            }

            await client.query('COMMIT');
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Toggle auto-renew
    static async toggleAutoRenew(id, memberId) {
        const result = await pool.query(
            `UPDATE public.member_memberships
             SET auto_renew = NOT auto_renew,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND member_id = $2
             RETURNING *`,
            [id, memberId]
        );
        return result.rows[0];
    }

    // ==================== RENEWAL & EXPIRY ====================
    
    // Process auto-renewals (cron job)
    static async processRenewals() {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Find memberships expiring in the next 7 days with auto-renew on
            const expiring = await client.query(
                `SELECT * FROM public.member_memberships
                 WHERE status = 'active'
                   AND auto_renew = true
                   AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
            );

            for (const membership of expiring.rows) {
                // Calculate new end date
                const newEndDate = new Date(membership.end_date);
                if (membership.billing_cycle === 'monthly') {
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                } else {
                    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                }

                // Update membership
                await client.query(
                    `UPDATE public.member_memberships
                     SET start_date = end_date,
                         end_date = $1,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [newEndDate, membership.id]
                );

                // Create history entry
                await client.query(
                    `INSERT INTO public.membership_history (
                        member_id, membership_id, action, amount
                    ) VALUES ($1, $2, 'renewed', $3)`,
                    [membership.member_id, membership.id, membership.price_paid]
                );
            }

            // Expire memberships that have passed end date
            await client.query(
                `UPDATE public.member_memberships
                 SET status = 'expired',
                     auto_renew = false,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE status = 'active'
                   AND end_date < CURRENT_DATE`
            );

            await client.query('COMMIT');
            return expiring.rows.length;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==================== STATISTICS ====================
    
    static async getStats() {
        const [
            totalActiveResult,
            monthlyRevenueResult,
            yearlyRevenueResult,
            planDistributionResult,
            expiringSoonResult
        ] = await Promise.all([
            pool.query(`
                SELECT COUNT(*) FROM public.member_memberships
                WHERE status = 'active' AND end_date >= CURRENT_DATE
            `),
            pool.query(`
                SELECT COALESCE(SUM(price_paid), 0) as total
                FROM public.member_memberships
                WHERE billing_cycle = 'monthly'
                  AND status = 'active'
                  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
            `),
            pool.query(`
                SELECT COALESCE(SUM(price_paid), 0) as total
                FROM public.member_memberships
                WHERE billing_cycle = 'yearly'
                  AND status = 'active'
                  AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
            `),
            pool.query(`
                SELECT p.name, COUNT(*) as count
                FROM public.member_memberships m
                JOIN public.membership_plans p ON m.plan_id = p.id
                WHERE m.status = 'active'
                GROUP BY p.name
                ORDER BY count DESC
            `),
            pool.query(`
                SELECT COUNT(*) FROM public.member_memberships
                WHERE status = 'active'
                  AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            `)
        ]);

        return {
            totalActiveMembers: parseInt(totalActiveResult.rows[0].count),
            monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0].total),
            yearlyRevenue: parseFloat(yearlyRevenueResult.rows[0].total),
            planDistribution: planDistributionResult.rows,
            expiringSoon: parseInt(expiringSoonResult.rows[0].count)
        };
    }

    // ==================== HISTORY ====================
    
    static async getHistory(memberId, limit = 20) {
        const query = `
            SELECT h.*, 
                   p1.name as previous_plan_name,
                   p2.name as new_plan_name
            FROM public.membership_history h
            LEFT JOIN public.membership_plans p1 ON h.previous_plan_id = p1.id
            LEFT JOIN public.membership_plans p2 ON h.new_plan_id = p2.id
            WHERE h.member_id = $1
            ORDER BY h.changed_at DESC
            LIMIT $2
        `;
        
        const result = await pool.query(query, [memberId, limit]);
        return result.rows;
    }
}

export default MemberMembership;