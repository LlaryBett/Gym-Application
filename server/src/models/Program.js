import pool from '../database/db.js';

class Program {
    // ==================== GET PROGRAMS ====================
    
    // Get all programs with pagination and filters - FIXED to include related data
    static async findAll(page = 1, limit = 8, filters = {}) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM public.programs WHERE status = $1';
        let values = ['active'];
        let paramCount = 2;

        // Apply filters
        if (filters.category) {
            query += ` AND category = $${paramCount}`;
            values.push(filters.category);
            paramCount++;
        }

        if (filters.level) {
            query += ` AND level = $${paramCount}`;
            values.push(filters.level);
            paramCount++;
        }

        if (filters.featured !== undefined && filters.featured !== '') {
            const isFeatured = filters.featured === true || filters.featured === 'true';
            query += ` AND featured = $${paramCount}`;
            values.push(isFeatured);
            paramCount++;
        }

        if (filters.search) {
            query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }

        // Add ordering and pagination
        query += ` ORDER BY featured DESC, display_order, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        const programs = result.rows;
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM public.programs WHERE status = $1';
        let countValues = ['active'];
        let countParamCount = 2;
        
        if (filters.category) {
            countQuery += ` AND category = $${countParamCount}`;
            countValues.push(filters.category);
            countParamCount++;
        }
        
        if (filters.level) {
            countQuery += ` AND level = $${countParamCount}`;
            countValues.push(filters.level);
            countParamCount++;
        }
        
        if (filters.featured !== undefined && filters.featured !== '') {
            const isFeatured = filters.featured === true || filters.featured === 'true';
            countQuery += ` AND featured = $${countParamCount}`;
            countValues.push(isFeatured);
            countParamCount++;
        }
        
        if (filters.search) {
            countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
            countValues.push(`%${filters.search}%`);
            countParamCount++;
        }
        
        const countResult = await pool.query(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].count);
        
        // If there are no programs, return empty array
        if (programs.length === 0) {
            return {
                programs: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0
                }
            };
        }

        // Get related data for all programs
        const programIds = programs.map(p => p.id);
        
        // 1. Get all schedules for these programs
        const schedulesQuery = `
            SELECT * FROM public.program_schedules 
            WHERE program_id = ANY($1::int[]) AND status = 'active'
            ORDER BY program_id, day_of_week, start_time
        `;
        const schedulesResult = await pool.query(schedulesQuery, [programIds]);
        const schedulesByProgram = {};
        schedulesResult.rows.forEach(schedule => {
            if (!schedulesByProgram[schedule.program_id]) {
                schedulesByProgram[schedule.program_id] = [];
            }
            schedulesByProgram[schedule.program_id].push(schedule);
        });
        
        // 2. Get all curriculum
        const curriculumQuery = `
            SELECT * FROM public.program_curriculum 
            WHERE program_id = ANY($1::int[])
            ORDER BY program_id, week_number
        `;
        const curriculumResult = await pool.query(curriculumQuery, [programIds]);
        const curriculumByProgram = {};
        curriculumResult.rows.forEach(item => {
            if (!curriculumByProgram[item.program_id]) {
                curriculumByProgram[item.program_id] = [];
            }
            curriculumByProgram[item.program_id].push(item);
        });
        
        // 3. Get all FAQs
        const faqsQuery = `
            SELECT * FROM public.program_faqs 
            WHERE program_id = ANY($1::int[])
            ORDER BY program_id, display_order
        `;
        const faqsResult = await pool.query(faqsQuery, [programIds]);
        const faqsByProgram = {};
        faqsResult.rows.forEach(faq => {
            if (!faqsByProgram[faq.program_id]) {
                faqsByProgram[faq.program_id] = [];
            }
            faqsByProgram[faq.program_id].push(faq);
        });
        
        // 4. Get all gallery images
        const galleryQuery = `
            SELECT * FROM public.program_gallery 
            WHERE program_id = ANY($1::int[])
            ORDER BY program_id, display_order
        `;
        const galleryResult = await pool.query(galleryQuery, [programIds]);
        const galleryByProgram = {};
        galleryResult.rows.forEach(image => {
            if (!galleryByProgram[image.program_id]) {
                galleryByProgram[image.program_id] = [];
            }
            galleryByProgram[image.program_id].push(image);
        });
        
        // 5. Get all start dates
        const startDatesQuery = `
            SELECT * FROM public.program_start_dates 
            WHERE program_id = ANY($1::int[]) AND status = 'active'
            ORDER BY program_id, start_date
        `;
        const startDatesResult = await pool.query(startDatesQuery, [programIds]);
        const startDatesByProgram = {};
        startDatesResult.rows.forEach(date => {
            if (!startDatesByProgram[date.program_id]) {
                startDatesByProgram[date.program_id] = [];
            }
            startDatesByProgram[date.program_id].push(date);
        });
        
        // 6. Get all related programs
        const relatedQuery = `
            SELECT pr.*, p.title, p.image, p.price, p.duration, p.category
            FROM public.program_related pr
            JOIN public.programs p ON pr.related_program_id = p.id
            WHERE pr.program_id = ANY($1::int[]) AND p.status = 'active'
            ORDER BY pr.program_id, pr.display_order
        `;
        const relatedResult = await pool.query(relatedQuery, [programIds]);
        const relatedByProgram = {};
        relatedResult.rows.forEach(rel => {
            if (!relatedByProgram[rel.program_id]) {
                relatedByProgram[rel.program_id] = [];
            }
            relatedByProgram[rel.program_id].push({
                id: rel.related_program_id,
                title: rel.title,
                image: rel.image,
                price: rel.price,
                duration: rel.duration,
                category: rel.category,
                display_order: rel.display_order
            });
        });
        
        // 7. Get all upgrade options
        const upgradeQuery = `
            SELECT pu.*, p.title, p.price, p.duration
            FROM public.program_upgrade_options pu
            JOIN public.programs p ON pu.upgrade_program_id = p.id
            WHERE pu.program_id = ANY($1::int[]) AND p.status = 'active'
            ORDER BY pu.program_id, pu.display_order
        `;
        const upgradeResult = await pool.query(upgradeQuery, [programIds]);
        const upgradeByProgram = {};
        upgradeResult.rows.forEach(up => {
            if (!upgradeByProgram[up.program_id]) {
                upgradeByProgram[up.program_id] = [];
            }
            upgradeByProgram[up.program_id].push({
                id: up.upgrade_program_id,
                title: up.title,
                price: up.price,
                duration: up.duration,
                badge_text: up.badge_text,
                display_order: up.display_order
            });
        });

        // Combine all data with each program
        const programsWithDetails = programs.map(program => ({
            ...program,
            schedule: schedulesByProgram[program.id] || [],
            curriculum: curriculumByProgram[program.id] || [],
            faqs: faqsByProgram[program.id] || [],
            gallery: galleryByProgram[program.id] || [],
            start_dates: startDatesByProgram[program.id] || [],
            related_programs: relatedByProgram[program.id] || [],
            upgrade_options: upgradeByProgram[program.id] || []
        }));

        return {
            programs: programsWithDetails,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    // ==================== FIXED: Get program by ID with ALL related data ====================
    static async findById(id) {
        try {
            // 1. Get the main program
            const programQuery = `
                SELECT * FROM public.programs 
                WHERE id = $1 AND status = 'active'
            `;
            const programResult = await pool.query(programQuery, [id]);
            const program = programResult.rows[0];
            
            if (!program) return null;

            // 2. Get gallery images
            const galleryQuery = `
                SELECT id, image_url, caption, display_order
                FROM public.program_gallery
                WHERE program_id = $1
                ORDER BY display_order
            `;
            const galleryResult = await pool.query(galleryQuery, [id]);
            
            // 3. Get curriculum
            const curriculumQuery = `
                SELECT id, week_number, week_title, topics, display_order
                FROM public.program_curriculum
                WHERE program_id = $1
                ORDER BY week_number
            `;
            const curriculumResult = await pool.query(curriculumQuery, [id]);
            
            // 4. Get FAQs
            const faqsQuery = `
                SELECT id, question, answer, display_order
                FROM public.program_faqs
                WHERE program_id = $1
                ORDER BY display_order
            `;
            const faqsResult = await pool.query(faqsQuery, [id]);
            
            // 5. Get start dates
            const startDatesQuery = `
                SELECT id, start_date, spots_available, total_spots, status
                FROM public.program_start_dates
                WHERE program_id = $1 AND status = 'active'
                ORDER BY start_date
            `;
            const startDatesResult = await pool.query(startDatesQuery, [id]);
            
            // 6. Get related programs
            const relatedQuery = `
                SELECT p.id, p.title, p.image, p.price, p.duration, p.category
                FROM public.program_related pr
                JOIN public.programs p ON pr.related_program_id = p.id
                WHERE pr.program_id = $1 AND p.status = 'active'
                ORDER BY pr.display_order
                LIMIT 3
            `;
            const relatedResult = await pool.query(relatedQuery, [id]);
            
            // 7. Get upgrade options
            const upgradeQuery = `
                SELECT p.id, p.title, p.price, p.duration, pu.badge_text, pu.display_order
                FROM public.program_upgrade_options pu
                JOIN public.programs p ON pu.upgrade_program_id = p.id
                WHERE pu.program_id = $1 AND p.status = 'active'
                ORDER BY pu.display_order
            `;
            const upgradeResult = await pool.query(upgradeQuery, [id]);
            
            // 8. Get schedules
            const schedulesQuery = `
                SELECT id, day_of_week, start_time, end_time, class_name, 
                       instructor, location, capacity, enrolled
                FROM public.program_schedules
                WHERE program_id = $1 AND status = 'active'
                ORDER BY day_of_week, start_time
            `;
            const schedulesResult = await pool.query(schedulesQuery, [id]);

            // Combine all data into a single program object
            return {
                ...program,
                gallery: galleryResult.rows || [],
                curriculum: curriculumResult.rows || [],
                faqs: faqsResult.rows || [],
                start_dates: startDatesResult.rows || [],
                related_programs: relatedResult.rows || [],
                upgrade_options: upgradeResult.rows || [],
                schedules: schedulesResult.rows || []
            };

        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    // Get featured programs
    static async getFeatured(limit = 4) {
        const query = `
            SELECT * FROM public.programs
            WHERE featured = true AND status = 'active'
            ORDER BY display_order
            LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        return result.rows;
    }

    // Get programs by category
    static async findByCategory(category, page = 1, limit = 8) {
        return this.findAll(page, limit, { category });
    }

    // ==================== CLASS SCHEDULE ====================
    
    // Get schedule by day
    static async getScheduleByDay(day) {
        const query = `
            SELECT s.*, p.title as program_title, p.image as program_image
            FROM public.program_schedules s
            JOIN public.programs p ON s.program_id = p.id
            WHERE s.day_of_week = $1 AND s.status = 'active' AND p.status = 'active'
            ORDER BY s.start_time
        `;
        
        const result = await pool.query(query, [day]);
        return result.rows;
    }

    // Get all schedules grouped by day
    static async getAllSchedules() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const schedules = {};
        
        for (const day of days) {
            const result = await this.getScheduleByDay(day);
            schedules[day] = result;
        }
        
        return schedules;
    }

    // ==================== ENROLLMENTS ====================
    
    // Enroll member in program
    static async enroll(memberId, programId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Check if already enrolled
            const existing = await client.query(
                'SELECT * FROM public.program_enrollments WHERE program_id = $1 AND member_id = $2',
                [programId, memberId]
            );
            
            if (existing.rows.length > 0) {
                throw new Error('Already enrolled in this program');
            }
            
            // Create enrollment
            const enrollmentQuery = `
                INSERT INTO public.program_enrollments (program_id, member_id, status, enrollment_date)
                VALUES ($1, $2, 'enrolled', CURRENT_DATE)
                RETURNING *
            `;
            
            const enrollmentResult = await client.query(enrollmentQuery, [programId, memberId]);
            
            // Update program enrolled count
            await client.query(
                `UPDATE public.programs 
                 SET enrolled_count = enrolled_count + 1
                 WHERE id = $1`,
                [programId]
            );
            
            await client.query('COMMIT');
            return enrollmentResult.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get member's enrolled programs
    static async getMemberEnrollments(memberId) {
        try {
            const query = `
                SELECT 
                    e.*, 
                    p.id as program_id,
                    p.title, 
                    p.image, 
                    p.description, 
                    p.category,
                    p.price,
                    p.duration,
                    p.level,
                    p.capacity,
                    p.enrolled_count
                FROM public.program_enrollments e
                JOIN public.programs p ON e.program_id = p.id
                WHERE e.member_id = $1
                ORDER BY e.created_at DESC
            `;
            
            const result = await pool.query(query, [memberId]);
            return result.rows;
        } catch (error) {
            console.error('❌ ERROR in getMemberEnrollments:', error);
            throw error;
        }
    }

    // ==================== SAVE/UNSAVE PROGRAM (WISHLIST) ====================
    
    // Save program to wishlist
    static async saveProgram(memberId, programId) {
        const query = `
            INSERT INTO public.user_saved_programs (member_id, program_id)
            VALUES ($1, $2)
            ON CONFLICT (member_id, program_id) DO NOTHING
            RETURNING *
        `;
        
        const result = await pool.query(query, [memberId, programId]);
        return result.rows[0];
    }

    // Unsave program from wishlist
    static async unsaveProgram(memberId, programId) {
        const query = `
            DELETE FROM public.user_saved_programs
            WHERE member_id = $1 AND program_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [memberId, programId]);
        return result.rows[0];
    }

    // Check if program is saved by member
    static async isProgramSaved(memberId, programId) {
        const query = `
            SELECT EXISTS(
                SELECT 1 FROM public.user_saved_programs
                WHERE member_id = $1 AND program_id = $2
            ) as saved
        `;
        
        const result = await pool.query(query, [memberId, programId]);
        return result.rows[0].saved;
    }

    // Get member's saved programs
    static async getSavedPrograms(memberId) {
        const query = `
            SELECT p.*
            FROM public.user_saved_programs s
            JOIN public.programs p ON s.program_id = p.id
            WHERE s.member_id = $1 AND p.status = 'active'
            ORDER BY s.saved_at DESC
        `;
        
        const result = await pool.query(query, [memberId]);
        return result.rows;
    }

    // ==================== CATEGORIES ====================
    
    // Get all program categories
    static async getCategories() {
        const query = `
            SELECT * FROM public.program_categories
            WHERE status = 'active'
            ORDER BY display_order
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }

    // ==================== ADMIN METHODS ====================
    
    // Create program (admin)
    static async create(programData) {
        const {
            title,
            image,
            description = '',
            category,
            price = '',
            capacity = '',
            featured = false,
            duration = '',
            level = 'All Levels',
            display_order = 0,
            instructor_id = null,
            instructor_name = '',
            instructor_bio = '',
            instructor_image = '',
            video_url = '',
            total_spots = 20,
            enrolled_count = 0
        } = programData;

        const query = `
            INSERT INTO public.programs (
                title, image, description, category, price, capacity,
                featured, duration, level, display_order, status,
                instructor_id, instructor_name, instructor_bio, instructor_image,
                video_url, total_spots, enrolled_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active',
                     $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;

        const values = [
            title, image, description, category, price, capacity, 
            featured, duration, level, display_order,
            instructor_id, instructor_name, instructor_bio, instructor_image,
            video_url, total_spots, enrolled_count
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update program (admin)
    static async update(id, programData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(programData)) {
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
            UPDATE public.programs
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete program (admin - soft delete)
    static async delete(id) {
        const result = await pool.query(
            `UPDATE public.programs
             SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }

    // ==================== GALLERY MANAGEMENT (ADMIN) ====================
    
    // Add gallery image
    static async addGalleryImage(programId, imageUrl, caption = '', displayOrder = 0) {
        const query = `
            INSERT INTO public.program_gallery (program_id, image_url, caption, display_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, imageUrl, caption, displayOrder]);
        return result.rows[0];
    }

    // Remove gallery image
    static async removeGalleryImage(imageId) {
        const result = await pool.query(
            'DELETE FROM public.program_gallery WHERE id = $1 RETURNING *',
            [imageId]
        );
        return result.rows[0];
    }

    // ==================== CURRICULUM MANAGEMENT (ADMIN) ====================
    
    // Add curriculum week
    static async addCurriculumWeek(programId, weekNumber, weekTitle, topics = []) {
        const query = `
            INSERT INTO public.program_curriculum (program_id, week_number, week_title, topics, display_order)
            VALUES ($1, $2, $3, $4, $2)
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, weekNumber, weekTitle, topics]);
        return result.rows[0];
    }

    // Update curriculum week
    static async updateCurriculumWeek(id, weekData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(weekData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        values.push(id);
        const query = `
            UPDATE public.program_curriculum
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Remove curriculum week
    static async removeCurriculumWeek(id) {
        const result = await pool.query(
            'DELETE FROM public.program_curriculum WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // ==================== FAQ MANAGEMENT (ADMIN) ====================
    
    // Add FAQ
    static async addFaq(programId, question, answer, displayOrder = 0) {
        const query = `
            INSERT INTO public.program_faqs (program_id, question, answer, display_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, question, answer, displayOrder]);
        return result.rows[0];
    }

    // Update FAQ
    static async updateFaq(id, faqData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(faqData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        values.push(id);
        const query = `
            UPDATE public.program_faqs
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Remove FAQ
    static async removeFaq(id) {
        const result = await pool.query(
            'DELETE FROM public.program_faqs WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // ==================== START DATES MANAGEMENT (ADMIN) ====================
    
    // Add start date
    static async addStartDate(programId, startDate, spotsAvailable, totalSpots) {
        const query = `
            INSERT INTO public.program_start_dates (program_id, start_date, spots_available, total_spots, status)
            VALUES ($1, $2, $3, $4, 'active')
            ON CONFLICT (program_id, start_date) 
            DO UPDATE SET spots_available = EXCLUDED.spots_available, total_spots = EXCLUDED.total_spots
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, startDate, spotsAvailable, totalSpots]);
        return result.rows[0];
    }

    // Update start date
    static async updateStartDate(id, spotsAvailable) {
        const query = `
            UPDATE public.program_start_dates
            SET spots_available = $1
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [spotsAvailable, id]);
        return result.rows[0];
    }

    // Remove start date
    static async removeStartDate(id) {
        const result = await pool.query(
            'DELETE FROM public.program_start_dates WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // ==================== RELATED PROGRAMS MANAGEMENT (ADMIN) ====================
    
    // Add related program
    static async addRelatedProgram(programId, relatedProgramId, displayOrder = 0) {
        const query = `
            INSERT INTO public.program_related (program_id, related_program_id, display_order)
            VALUES ($1, $2, $3)
            ON CONFLICT (program_id, related_program_id) DO NOTHING
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, relatedProgramId, displayOrder]);
        return result.rows[0];
    }

    // Remove related program
    static async removeRelatedProgram(programId, relatedProgramId) {
        const result = await pool.query(
            'DELETE FROM public.program_related WHERE program_id = $1 AND related_program_id = $2 RETURNING *',
            [programId, relatedProgramId]
        );
        return result.rows[0];
    }

    // ==================== UPGRADE OPTIONS MANAGEMENT (ADMIN) ====================
    
    // Add upgrade option
    static async addUpgradeOption(programId, upgradeProgramId, badgeText = '', displayOrder = 0) {
        const query = `
            INSERT INTO public.program_upgrade_options (program_id, upgrade_program_id, badge_text, display_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (program_id, upgrade_program_id) DO NOTHING
            RETURNING *
        `;
        
        const result = await pool.query(query, [programId, upgradeProgramId, badgeText, displayOrder]);
        return result.rows[0];
    }

    // Remove upgrade option
    static async removeUpgradeOption(programId, upgradeProgramId) {
        const result = await pool.query(
            'DELETE FROM public.program_upgrade_options WHERE program_id = $1 AND upgrade_program_id = $2 RETURNING *',
            [programId, upgradeProgramId]
        );
        return result.rows[0];
    }

    // ==================== SCHEDULE MANAGEMENT (ADMIN) ====================
    
    // Create schedule
    static async createSchedule(scheduleData) {
        const {
            program_id,
            day_of_week,
            start_time,
            end_time,
            class_name,
            instructor = '',
            location = '',
            capacity = 20,
            enrolled = 0
        } = scheduleData;

        const query = `
            INSERT INTO public.program_schedules (
                program_id, day_of_week, start_time, end_time,
                class_name, instructor, location, capacity, enrolled, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
            RETURNING *
        `;

        const values = [program_id, day_of_week, start_time, end_time, class_name, instructor, location, capacity, enrolled];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update schedule
    static async updateSchedule(id, scheduleData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(scheduleData)) {
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
            UPDATE public.program_schedules
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete schedule
    static async deleteSchedule(id) {
        const result = await pool.query(
            `UPDATE public.program_schedules
             SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }

    // ==================== STATISTICS ====================
    
    static async getStats() {
        const [
            totalResult,
            featuredResult,
            categoriesResult,
            enrollmentsResult,
            savedResult
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM public.programs WHERE status = 'active'`),
            pool.query(`SELECT COUNT(*) FROM public.programs WHERE featured = true AND status = 'active'`),
            pool.query(`
                SELECT category, COUNT(*) as count
                FROM public.programs
                WHERE status = 'active'
                GROUP BY category
                ORDER BY count DESC
            `),
            pool.query(`
                SELECT COUNT(*) FROM public.program_enrollments
                WHERE status = 'enrolled'
            `),
            pool.query(`
                SELECT COUNT(*) FROM public.user_saved_programs
            `)
        ]);

        return {
            total: parseInt(totalResult.rows[0].count),
            featured: parseInt(featuredResult.rows[0].count),
            categories: categoriesResult.rows,
            totalEnrollments: parseInt(enrollmentsResult.rows[0].count),
            totalSaved: parseInt(savedResult.rows[0].count)
        };
    }
}

export default Program;