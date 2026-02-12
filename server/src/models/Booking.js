import pool from '../database/db.js';

class Booking {
    // ==================== CREATE BOOKING ====================
    static async create(bookingData) {
        const {
            member_id,
            trainer_id,
            service_id,
            service_name,
            trainer_name,
            member_name,
            member_email,
            booking_date,
            booking_time,
            session_type = 'one-on-one',
            duration_minutes = 60,
            notes = '',
            special_requests = ''
        } = bookingData;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Insert booking
            const bookingQuery = `
                INSERT INTO public.bookings (
                    member_id, trainer_id, service_id, service_name, trainer_name,
                    member_name, member_email, booking_date, booking_time, session_type,
                    duration_minutes, notes, special_requests, status, payment_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', 'unpaid')
                RETURNING *
            `;
            
            const bookingValues = [
                member_id, trainer_id, service_id, service_name, trainer_name,
                member_name, member_email, booking_date, booking_time, session_type,
                duration_minutes, notes, special_requests
            ];
            
            const bookingResult = await client.query(bookingQuery, bookingValues);
            const booking = bookingResult.rows[0];
            
            // Mark availability slot as booked
            await client.query(
                `UPDATE public.availability_slots 
                 SET is_booked = true, booking_id = $1 
                 WHERE trainer_id = $2 AND available_date = $3 AND available_time = $4`,
                [booking.id, trainer_id, booking_date, booking_time]
            );
            
            // Create booking history entry
            await client.query(
                `INSERT INTO public.booking_history (booking_id, action, previous_status, new_status, changed_by)
                 VALUES ($1, 'created', NULL, 'pending', $2)`,
                [booking.id, member_id]
            );
            
            await client.query('COMMIT');
            return booking;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Create booking error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // ==================== GET BOOKINGS ====================
    
    // Get booking by ID
    static async findById(id) {
        const query = `
            SELECT b.*, 
                   s.title as service_title,
                   t.name as trainer_full_name,
                   m.first_name || ' ' || m.last_name as member_full_name
            FROM public.bookings b
            LEFT JOIN public.services s ON b.service_id = s.id
            LEFT JOIN public.trainers t ON b.trainer_id = t.id
            LEFT JOIN public.members m ON b.member_id = m.id
            WHERE b.id = $1 AND b.status != 'deleted'
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get bookings by member ID
    static async findByMemberId(memberId, page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT b.*, 
                   s.title as service_title,
                   t.name as trainer_name,
                   t.specialty as trainer_specialty,
                   t.image as trainer_image
            FROM public.bookings b
            LEFT JOIN public.services s ON b.service_id = s.id
            LEFT JOIN public.trainers t ON b.trainer_id = t.id
            WHERE b.member_id = $1 AND b.status != 'deleted'
        `;
        let values = [memberId];
        let paramCount = 2;

        // Apply status filter
        if (filters.status) {
            query += ` AND b.status = $${paramCount}`;
            values.push(filters.status);
            paramCount++;
        }

        // Apply date range filter
        if (filters.from_date) {
            query += ` AND b.booking_date >= $${paramCount}`;
            values.push(filters.from_date);
            paramCount++;
        }
        
        if (filters.to_date) {
            query += ` AND b.booking_date <= $${paramCount}`;
            values.push(filters.to_date);
            paramCount++;
        }

        // Apply upcoming/past filter
        if (filters.upcoming === 'true') {
            query += ` AND b.booking_date >= CURRENT_DATE AND b.status IN ('pending', 'confirmed')`;
        } else if (filters.past === 'true') {
            query += ` AND (b.booking_date < CURRENT_DATE OR b.status IN ('completed', 'cancelled', 'no-show'))`;
        }

        query += ` ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        
        // Get total count
        let countQuery = `SELECT COUNT(*) FROM public.bookings WHERE member_id = $1 AND status != 'deleted'`;
        const countResult = await pool.query(countQuery, [memberId]);
        
        return {
            bookings: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        };
    }

    // Get bookings by trainer ID
    static async findByTrainerId(trainerId, page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT b.*, 
                   s.title as service_title,
                   m.first_name || ' ' || m.last_name as member_name,
                   m.email as member_email,
                   m.cell_phone as member_phone
            FROM public.bookings b
            LEFT JOIN public.services s ON b.service_id = s.id
            LEFT JOIN public.members m ON b.member_id = m.id
            WHERE b.trainer_id = $1 AND b.status != 'deleted'
        `;
        let values = [trainerId];
        let paramCount = 2;

        // Apply status filter
        if (filters.status) {
            query += ` AND b.status = $${paramCount}`;
            values.push(filters.status);
            paramCount++;
        }

        // Apply date filter
        if (filters.date) {
            query += ` AND b.booking_date = $${paramCount}`;
            values.push(filters.date);
            paramCount++;
        }

        query += ` ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        
        return {
            bookings: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rows.length
            }
        };
    }

    // Get all bookings (admin)
    static async findAll(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT b.*, 
                   s.title as service_title,
                   t.name as trainer_name,
                   m.first_name || ' ' || m.last_name as member_name
            FROM public.bookings b
            LEFT JOIN public.services s ON b.service_id = s.id
            LEFT JOIN public.trainers t ON b.trainer_id = t.id
            LEFT JOIN public.members m ON b.member_id = m.id
            WHERE b.status != 'deleted'
        `;
        let values = [];
        let paramCount = 1;

        // Apply filters
        if (filters.status) {
            query += ` AND b.status = $${paramCount}`;
            values.push(filters.status);
            paramCount++;
        }

        if (filters.member_id) {
            query += ` AND b.member_id = $${paramCount}`;
            values.push(filters.member_id);
            paramCount++;
        }

        if (filters.trainer_id) {
            query += ` AND b.trainer_id = $${paramCount}`;
            values.push(filters.trainer_id);
            paramCount++;
        }

        if (filters.from_date) {
            query += ` AND b.booking_date >= $${paramCount}`;
            values.push(filters.from_date);
            paramCount++;
        }

        if (filters.to_date) {
            query += ` AND b.booking_date <= $${paramCount}`;
            values.push(filters.to_date);
            paramCount++;
        }

        query += ` ORDER BY b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        
        // Get total count
        let countQuery = `SELECT COUNT(*) FROM public.bookings WHERE status != 'deleted'`;
        const countResult = await pool.query(countQuery);
        
        return {
            bookings: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        };
    }

    // ==================== UPDATE BOOKING ====================
    
    // Update booking status
    static async updateStatus(id, status, changedBy, reason = null) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get current status
            const current = await client.query(
                'SELECT status FROM public.bookings WHERE id = $1',
                [id]
            );
            
            const previousStatus = current.rows[0]?.status;
            
            // Update status
            const statusField = status === 'cancelled' ? 'cancelled_at' : 
                              status === 'completed' ? 'completed_at' : null;
            
            let updateQuery = `UPDATE public.bookings SET status = $1`;
            if (statusField) {
                updateQuery += `, ${statusField} = CURRENT_TIMESTAMP`;
            }
            if (status === 'cancelled' && reason) {
                updateQuery += `, cancellation_reason = $2`;
            }
            updateQuery += ` WHERE id = $${status === 'cancelled' && reason ? '3' : '2'} RETURNING *`;
            
            const values = [status];
            if (status === 'cancelled' && reason) {
                values.push(reason, id);
            } else {
                values.push(id);
            }
            
            const result = await client.query(updateQuery, values);
            
            // Create history entry
            await client.query(
                `INSERT INTO public.booking_history (booking_id, action, previous_status, new_status, changed_by, notes)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [id, status, previousStatus, status, changedBy, reason]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Reschedule booking
    static async reschedule(id, newDate, newTime, changedBy) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get current booking
            const booking = await client.query(
                'SELECT trainer_id, booking_date, booking_time, reschedule_count FROM public.bookings WHERE id = $1',
                [id]
            );
            
            // Free up old slot
            await client.query(
                `UPDATE public.availability_slots 
                 SET is_booked = false, booking_id = NULL 
                 WHERE trainer_id = $1 AND available_date = $2 AND available_time = $3`,
                [booking.rows[0].trainer_id, booking.rows[0].booking_date, booking.rows[0].booking_time]
            );
            
            // Book new slot
            await client.query(
                `UPDATE public.availability_slots 
                 SET is_booked = true, booking_id = $1 
                 WHERE trainer_id = $2 AND available_date = $3 AND available_time = $4`,
                [id, booking.rows[0].trainer_id, newDate, newTime]
            );
            
            // Update booking
            const result = await client.query(
                `UPDATE public.bookings 
                 SET booking_date = $1, booking_time = $2, reschedule_count = $3, status = 'confirmed'
                 WHERE id = $4 RETURNING *`,
                [newDate, newTime, (booking.rows[0].reschedule_count || 0) + 1, id]
            );
            
            // Create history entry
            await client.query(
                `INSERT INTO public.booking_history (booking_id, action, previous_status, new_status, changed_by, notes)
                 VALUES ($1, 'rescheduled', 'confirmed', 'confirmed', $2, $3)`,
                [id, changedBy, `Rescheduled from ${booking.rows[0].booking_date} ${booking.rows[0].booking_time}`]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // ==================== DELETE BOOKING ====================
    
    // Soft delete
    static async delete(id) {
        const result = await pool.query(
            `UPDATE public.bookings 
             SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }

    // ==================== AVAILABILITY ====================
    
    // Check availability
    static async checkAvailability(trainerId, date) {
        const query = `
            SELECT available_time, is_booked
            FROM public.availability_slots
            WHERE trainer_id = $1 AND available_date = $2
            ORDER BY available_time
        `;
        
        const result = await pool.query(query, [trainerId, date]);
        return result.rows;
    }

    // Create availability slots
    static async createAvailabilitySlots(trainerId, date, times) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const slots = [];
            for (const time of times) {
                const result = await client.query(
                    `INSERT INTO public.availability_slots (trainer_id, available_date, available_time, is_booked)
                     VALUES ($1, $2, $3, false)
                     ON CONFLICT (trainer_id, available_date, available_time) 
                     DO NOTHING
                     RETURNING *`,
                    [trainerId, date, time]
                );
                if (result.rows[0]) slots.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            return slots;
            
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
            totalResult,
            pendingResult,
            confirmedResult,
            completedResult,
            cancelledResult,
            revenueResult,
            popularServicesResult,
            popularTrainersResult
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM public.bookings WHERE status != 'deleted'`),
            pool.query(`SELECT COUNT(*) FROM public.bookings WHERE status = 'pending'`),
            pool.query(`SELECT COUNT(*) FROM public.bookings WHERE status = 'confirmed'`),
            pool.query(`SELECT COUNT(*) FROM public.bookings WHERE status = 'completed'`),
            pool.query(`SELECT COUNT(*) FROM public.bookings WHERE status = 'cancelled'`),
            pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM public.booking_payments WHERE status = 'completed'`),
            pool.query(`
                SELECT service_name, COUNT(*) as count 
                FROM public.bookings 
                WHERE status != 'deleted' 
                GROUP BY service_name 
                ORDER BY count DESC 
                LIMIT 5
            `),
            pool.query(`
                SELECT trainer_name, COUNT(*) as count 
                FROM public.bookings 
                WHERE status != 'deleted' AND trainer_name IS NOT NULL
                GROUP BY trainer_name 
                ORDER BY count DESC 
                LIMIT 5
            `)
        ]);

        return {
            total: parseInt(totalResult.rows[0].count),
            pending: parseInt(pendingResult.rows[0].count),
            confirmed: parseInt(confirmedResult.rows[0].count),
            completed: parseInt(completedResult.rows[0].count),
            cancelled: parseInt(cancelledResult.rows[0].count),
            revenue: parseFloat(revenueResult.rows[0].total),
            popularServices: popularServicesResult.rows,
            popularTrainers: popularTrainersResult.rows
        };
    }

    // ==================== HISTORY ====================
    
    static async getHistory(bookingId) {
        const query = `
            SELECT * FROM public.booking_history
            WHERE booking_id = $1
            ORDER BY changed_at DESC
        `;
        
        const result = await pool.query(query, [bookingId]);
        return result.rows;
    }
}

export default Booking;