import Member from '../models/Members.js';
import { memberSchemas } from '../utils/validation.js';
import pool from '../database/db.js';

// Get all members (admin route)
export const getAllMembers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search 
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await Member.findAll(page, limit, filters);
    
    // Format members for response
    const formattedMembers = result.members.map(member => ({
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status,
      membershipType: member.membership_type,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        members: formattedMembers,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members'
    });
  }
};

// Get member by ID
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Format member data for response
    const formattedMember = {
      id: member.id,
      membershipNumber: member.membership_number,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      phone: member.cell_phone,
      gender: member.gender,
      dateOfBirth: member.date_of_birth,
      inquiry: member.inquiry,
      referralSource: member.hear_about_us,
      emergencyContact: {
        name: member.emergency_contact_name,
        phone: member.emergency_contact_phone,
        email: member.emergency_contact_email,
        relationship: member.emergency_contact_relationship
      },
      address: member.address,
      city: member.city,
      state: member.state,
      zipCode: member.zip_code,
      country: member.country,
      status: member.status,
      membershipType: member.membership_type,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    };
    
    res.json({
      success: true,
      data: formattedMember
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member'
    });
  }
};

// Update member
export const updateMember = async (req, res) => {
  try {
    // Validate update data
    const { error, value } = memberSchemas.update.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Transform camelCase to snake_case for database if needed
    const updateData = transformUpdateData(value);
    
    const member = await Member.update(req.params.id, updateData);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Format response
    const formattedMember = {
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      phone: member.cell_phone,
      status: member.status,
      updatedAt: member.updated_at
    };
    
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: formattedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member'
    });
  }
};

// Helper function to transform update data
function transformUpdateData(data) {
  const transformed = { ...data };
  
  // Handle name field - split into first_name and last_name
  if (transformed.name) {
    const nameParts = transformed.name.trim().split(' ');
    transformed.first_name = nameParts[0] || '';
    transformed.last_name = nameParts.slice(1).join(' ') || '';
    delete transformed.name;
  }
  
  // Map phone to cell_phone
  if (transformed.phone !== undefined) {
    transformed.cell_phone = transformed.phone;
    delete transformed.phone;
  }
  
  // Map referral_source to hear_about_us
  if (transformed.referral_source !== undefined) {
    transformed.hear_about_us = transformed.referral_source;
    delete transformed.referral_source;
  }
  
  // Map membershipType to membership_type
  if (transformed.membershipType !== undefined) {
    transformed.membership_type = transformed.membershipType;
    delete transformed.membershipType;
  }
  
  // Map dateOfBirth to date_of_birth
  if (transformed.dateOfBirth !== undefined) {
    transformed.date_of_birth = transformed.dateOfBirth;
    delete transformed.dateOfBirth;
  }
  
  // Map hearAboutUs to hear_about_us
  if (transformed.hearAboutUs !== undefined) {
    transformed.hear_about_us = transformed.hearAboutUs;
    delete transformed.hearAboutUs;
  }
  
  // Map cellPhone to cell_phone
  if (transformed.cellPhone !== undefined) {
    transformed.cell_phone = transformed.cellPhone;
    delete transformed.cellPhone;
  }
  
  // Map firstName and lastName
  if (transformed.firstName !== undefined) {
    transformed.first_name = transformed.firstName;
    delete transformed.firstName;
  }
  
  if (transformed.lastName !== undefined) {
    transformed.last_name = transformed.lastName;
    delete transformed.lastName;
  }
  
  return transformed;
}

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.delete(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member deleted successfully',
      data: {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email
      }
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member'
    });
  }
};

// Get member statistics
export const getMemberStats = async (req, res) => {
  try {
    const [totalMembers, recentMembers, statusCounts] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM public.members'),
      Member.getRecent(5),
      Member.countByStatus()
    ]);

    const total = parseInt(totalMembers.rows[0].count);
    
    // Format recent members
    const formattedRecentMembers = recentMembers.map(member => ({
      id: member.id,
      membershipNumber: member.membership_number,
      name: `${member.first_name} ${member.last_name}`.trim(),
      email: member.email,
      status: member.status,
      createdAt: member.created_at
    }));
    
    // Format status counts
    const formattedStatusCounts = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalMembers: total,
        recentMembers: formattedRecentMembers,
        statusCounts: formattedStatusCounts,
        todayCount: await getTodayRegistrations()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Helper function to get today's registrations
async function getTodayRegistrations() {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM public.members 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Today registrations error:', error);
    return 0;
  }
}