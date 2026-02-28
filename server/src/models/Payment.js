// server/src/models/Payment.js
import pool from '../database/db.js';

class Payment {
  // ==================== CREATE PAYMENT ====================
  
  // Create a new payment record
  static async create(data) {
    try {
      const {
        reference,
        member_id,
        amount,
        currency = 'KES',
        metadata = {}
      } = data;

      const query = `
        INSERT INTO payments (
          reference,
          member_id,
          amount,
          currency,
          status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(query, [
        reference,
        member_id,
        amount,
        currency,
        'pending',
        JSON.stringify(metadata)
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in Payment.create:', error);
      throw error;
    }
  }

  // ==================== FIND PAYMENT ====================
  
  // Find payment by reference (MISSING METHOD - ADD THIS)
  static async findByReference(reference) {
    try {
      console.log('🔍 Finding payment by reference:', reference);
      
      const query = `
        SELECT 
          p.*,
          m.first_name,
          m.last_name,
          m.email
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        WHERE p.reference = $1
      `;
      
      const result = await pool.query(query, [reference]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Payment.findByReference:', error);
      throw error;
    }
  }

  // Find payment by transaction ID
  static async findByTransactionId(transactionId) {
    try {
      const query = 'SELECT * FROM payments WHERE transaction_id = $1';
      const result = await pool.query(query, [transactionId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Payment.findByTransactionId:', error);
      throw error;
    }
  }

  // ==================== UPDATE PAYMENT ====================

  // Update payment after successful transaction
  static async updateAfterSuccess(reference, data) {
    try {
      const {
        transaction_id,
        payment_method,
        channel,
        membership_id,
        paystack_data = {}
      } = data;

      const query = `
        UPDATE payments 
        SET 
          status = 'success',
          transaction_id = $2,
          payment_method = $3,
          channel = $4,
          membership_id = $5,
          paystack_data = $6,
          paid_at = NOW(),
          updated_at = NOW()
        WHERE reference = $1
        RETURNING *
      `;

      const result = await pool.query(query, [
        reference,
        transaction_id,
        payment_method,
        channel,
        membership_id,
        JSON.stringify(paystack_data)
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in Payment.updateAfterSuccess:', error);
      throw error;
    }
  }

  // Update payment after failed transaction
  static async updateAfterFailure(reference, data) {
    try {
      const {
        message,
        status = 'failed',
        paystack_data = {}
      } = data;

      const query = `
        UPDATE payments 
        SET 
          status = $2,
          failure_reason = $3,
          paystack_data = $4,
          updated_at = NOW()
        WHERE reference = $1
        RETURNING *
      `;

      const result = await pool.query(query, [
        reference,
        status,
        message,
        JSON.stringify(paystack_data)
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in Payment.updateAfterFailure:', error);
      throw error;
    }
  }

  // ==================== FETCH PAYMENT HISTORY ====================

  // Get payment history for a specific member (for member dashboard)
  static async getMemberPaymentHistory(memberId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          p.id,
          p.reference,
          p.amount,
          p.currency,
          p.status,
          p.payment_method,
          p.channel,
          p.paid_at,
          p.created_at,
          mp.name as plan_name,
          mm.billing_cycle,
          mm.start_date,
          mm.end_date
        FROM payments p
        LEFT JOIN member_memberships mm ON p.membership_id = mm.id
        LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
        WHERE p.member_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [memberId, limit, offset]);
      
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM payments WHERE member_id = $1';
      const countResult = await pool.query(countQuery, [memberId]);
      
      return {
        payments: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getMemberPaymentHistory:', error);
      throw error;
    }
  }

  // Get all payments for admin (with filters)
  static async getAllPaymentsForAdmin(filters = {}, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          p.id,
          p.reference,
          p.transaction_id,
          p.amount,
          p.currency,
          p.status,
          p.payment_method,
          p.channel,
          p.paid_at,
          p.created_at,
          p.metadata,
          p.paystack_data,
          m.id as member_id,
          m.first_name,
          m.last_name,
          m.email,
          mp.name as plan_name,
          mm.membership_number
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN member_memberships mm ON p.membership_id = mm.id
        LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;

      // Apply filters
      if (filters.status) {
        query += ` AND p.status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.member_id) {
        query += ` AND p.member_id = $${paramCount}`;
        values.push(filters.member_id);
        paramCount++;
      }

      if (filters.startDate && filters.endDate) {
        query += ` AND DATE(p.created_at) BETWEEN $${paramCount} AND $${paramCount + 1}`;
        values.push(filters.startDate, filters.endDate);
        paramCount += 2;
      }

      if (filters.search) {
        query += ` AND (
          p.reference ILIKE $${paramCount} OR
          m.first_name ILIKE $${paramCount} OR
          m.last_name ILIKE $${paramCount} OR
          m.email ILIKE $${paramCount}
        )`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      
      // Get total count with same filters
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        WHERE 1=1
      `;
      
      let countValues = [];
      let countParamCount = 1;

      if (filters.status) {
        countQuery += ` AND p.status = $${countParamCount}`;
        countValues.push(filters.status);
        countParamCount++;
      }

      if (filters.member_id) {
        countQuery += ` AND p.member_id = $${countParamCount}`;
        countValues.push(filters.member_id);
        countParamCount++;
      }

      if (filters.startDate && filters.endDate) {
        countQuery += ` AND DATE(p.created_at) BETWEEN $${countParamCount} AND $${countParamCount + 1}`;
        countValues.push(filters.startDate, filters.endDate);
        countParamCount += 2;
      }

      if (filters.search) {
        countQuery += ` AND (
          p.reference ILIKE $${countParamCount} OR
          m.first_name ILIKE $${countParamCount} OR
          m.last_name ILIKE $${countParamCount} OR
          m.email ILIKE $${countParamCount}
        )`;
        countValues.push(`%${filters.search}%`);
        countParamCount++;
      }

      const countResult = await pool.query(countQuery, countValues);
      
      return {
        payments: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllPaymentsForAdmin:', error);
      throw error;
    }
  }

  // Get payment summary/stats for admin dashboard
  static async getPaymentStats(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      let dateFilter = '';
      const values = [];
      let paramCount = 1;

      if (startDate && endDate) {
        dateFilter = ` WHERE DATE(created_at) BETWEEN $${paramCount} AND $${paramCount + 1}`;
        values.push(startDate, endDate);
        paramCount += 2;
      }

      const query = `
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_revenue,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COALESCE(AVG(CASE WHEN status = 'success' THEN amount END), 0) as average_transaction_value
        FROM payments
        ${dateFilter}
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getPaymentStats:', error);
      throw error;
    }
  }

  // Get single payment by ID (admin view)
  static async getPaymentByIdForAdmin(id) {
    try {
      const query = `
        SELECT 
          p.*,
          m.first_name,
          m.last_name,
          m.email,
          m.phone,
          mp.name as plan_name,
          mm.membership_number,
          mm.start_date as membership_start,
          mm.end_date as membership_end,
          mm.billing_cycle
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN member_memberships mm ON p.membership_id = mm.id
        LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
        WHERE p.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getPaymentByIdForAdmin:', error);
      throw error;
    }
  }

  // Get single payment by reference (member view - masked)
  static async getPaymentByReferenceForMember(reference, memberId) {
    try {
      const query = `
        SELECT 
          p.id,
          p.reference,
          p.amount,
          p.currency,
          p.status,
          CASE 
            WHEN p.status = 'success' THEN p.payment_method
            ELSE '****'
          END as payment_method,
          p.paid_at,
          p.created_at,
          mp.name as plan_name,
          mm.billing_cycle,
          mm.start_date,
          mm.end_date,
          CASE 
            WHEN p.status = 'success' THEN CONCAT('Receipt-', p.reference, '.pdf')
            ELSE NULL
          END as receipt_url
        FROM payments p
        LEFT JOIN member_memberships mm ON p.membership_id = mm.id
        LEFT JOIN membership_plans mp ON mm.plan_id = mp.id
        WHERE p.reference = $1 AND p.member_id = $2
      `;
      
      const result = await pool.query(query, [reference, memberId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getPaymentByReferenceForMember:', error);
      throw error;
    }
  }
}

export default Payment;