// server/src/models/MemberCard.js
import pool from '../database/db.js';

class MemberCard {
  // Create a new card after membership purchase
  static async create(cardData) {
    const {
      member_id,
      membership_id,
      card_number,
      card_holder_name,
      expiry_date,
      cvv,
      card_type,
      card_brand,
      card_color,
      card_design,
      is_active = true
    } = cardData;

    const query = `
      INSERT INTO member_cards (
        member_id, membership_id, card_number, card_holder_name,
        expiry_date, cvv, card_type, card_brand, card_color,
        card_design, is_active, issued_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const values = [
      member_id, membership_id, card_number, card_holder_name,
      expiry_date, cvv, card_type, card_brand, card_color,
      card_design, is_active
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get card by member ID
  static async findByMemberId(memberId) {
    const query = `
      SELECT 
        c.*,
        m.first_name,
        m.last_name,
        mp.name as plan_name,
        mp.price_monthly,
        mp.price_yearly
      FROM member_cards c
      JOIN members m ON c.member_id = m.id
      JOIN member_memberships ms ON c.membership_id = ms.id
      JOIN membership_plans mp ON ms.plan_id = mp.id
      WHERE c.member_id = $1 AND c.is_active = true
      ORDER BY c.issued_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [memberId]);
    return result.rows[0];
  }

  // Generate unique card number (BIN + random)
  static generateCardNumber() {
    // Mastercard BIN ranges: 51-55, 2221-2720
    const bin = '52'; // 52xxxx Mastercard
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return (bin + random).slice(0, 16);
  }

  // Generate CVV
  static generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  // Calculate expiry (3 years from now)
  static calculateExpiry() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date;
  }

  // Format card number with spaces
  static formatCardNumber(number) {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  }

  // Mask card number (show last 4)
  static maskCardNumber(number) {
    return '•••• •••• •••• ' + number.slice(-4);
  }
}

export default MemberCard;