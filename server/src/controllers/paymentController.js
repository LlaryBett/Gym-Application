// server/src/controllers/paymentController.js
import Payment from '../models/Payment.js';

// ==================== MEMBER ROUTES ====================

// Get current user's payment history
export const getMyPaymentHistory = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`📋 Fetching payment history for member: ${memberId}`);

    const result = await Payment.getMemberPaymentHistory(memberId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get my payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// Get specific payment by reference (for member)
export const getMyPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const memberId = req.user.id;

    console.log(`📋 Fetching payment ${reference} for member: ${memberId}`);

    const payment = await Payment.getPaymentByReferenceForMember(reference, memberId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('❌ Get my payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
};

// ==================== ADMIN ROUTES ====================

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      member_id, 
      startDate, 
      endDate, 
      search 
    } = req.query;

    console.log('📋 Admin fetching all payments with filters:', req.query);

    const filters = {
      status,
      member_id,
      startDate,
      endDate,
      search
    };

    const result = await Payment.getAllPaymentsForAdmin(filters, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment by ID (admin)
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📋 Admin fetching payment ID: ${id}`);

    const payment = await Payment.getPaymentByIdForAdmin(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('❌ Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
};

// Get payment statistics (admin)
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('📊 Fetching payment stats:', { startDate, endDate });

    const stats = await Payment.getPaymentStats({ startDate, endDate });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};