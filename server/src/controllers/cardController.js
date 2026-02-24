// server/src/controllers/cardController.js
import MemberCard from '../models/MemberCard.js';
import Member from '../models/Members.js';
import MemberMembership from '../models/MemberMembership.js';
import { v4 as uuidv4 } from 'uuid';

export const issueMembershipCard = async (req, res) => {
  try {
    const member_id = req.user.id;
    
    // Get member details
    const member = await Member.findById(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get active membership
    const membership = await MemberMembership.getActiveByMemberId(member_id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No active membership found'
      });
    }

    // Check if card already exists
    const existingCard = await MemberCard.findByMemberId(member_id);
    if (existingCard) {
      return res.json({
        success: true,
        data: existingCard,
        message: 'Existing card retrieved'
      });
    }

    // Generate card details
    const cardNumber = MemberCard.generateCardNumber();
    const cvv = MemberCard.generateCVV();
    const expiryDate = MemberCard.calculateExpiry();

    // Determine card design based on membership plan
    const cardDesign = getCardDesign(membership.plan_name);
    
    // Card brand (always Mastercard for this example)
    const cardBrand = 'mastercard';

    // Create card
    const card = await MemberCard.create({
      member_id,
      membership_id: membership.id,
      card_number: cardNumber,
      card_holder_name: `${member.first_name} ${member.last_name}`.toUpperCase(),
      expiry_date: expiryDate,
      cvv,
      card_type: membership.plan_name.toLowerCase().includes('premium') ? 'premium' : 'standard',
      card_brand: cardBrand,
      card_color: cardDesign.color,
      card_design: cardDesign.name,
      is_active: true
    });

    res.status(201).json({
      success: true,
      data: card,
      message: 'Card issued successfully'
    });

  } catch (error) {
    console.error('Issue card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue card'
    });
  }
};

export const getMyCard = async (req, res) => {
  try {
    const card = await MemberCard.findByMemberId(req.user.id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'No card found'
      });
    }

    // Mask sensitive data
    const maskedCard = {
      ...card,
      card_number: MemberCard.maskCardNumber(card.card_number),
      cvv: '•••',
      full_card_number: card.card_number // Only for display when needed
    };

    res.json({
      success: true,
      data: maskedCard
    });

  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch card'
    });
  }
};

export const getFullCardDetails = async (req, res) => {
  try {
    const card = await MemberCard.findByMemberId(req.user.id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'No card found'
      });
    }

    // Only return full details for authenticated requests
    res.json({
      success: true,
      data: {
        ...card,
        formatted_number: MemberCard.formatCardNumber(card.card_number)
      }
    });

  } catch (error) {
    console.error('Get full card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch card details'
    });
  }
};

// Helper function to get card design based on plan
function getCardDesign(planName) {
  const designs = {
    'Premium': {
      name: 'premium_black',
      color: 'from-gray-900 via-gray-800 to-black',
      pattern: 'premium',
      gradient: ['#000000', '#1a1a1a', '#333333']
    },
    'Pro': {
      name: 'pro_blue',
      color: 'from-blue-900 via-blue-800 to-indigo-900',
      pattern: 'pro',
      gradient: ['#1e3a8a', '#1e40af', '#3730a3']
    },
    'Basic': {
      name: 'basic_green',
      color: 'from-green-900 via-green-800 to-emerald-900',
      pattern: 'basic',
      gradient: ['#064e3b', '#065f46', '#047857']
    }
  };

  for (const [key, design] of Object.entries(designs)) {
    if (planName.includes(key)) return design;
  }

  return designs.Basic;
}