// client/src/services/cardService.js
import { cardAPI } from './api';

class CardService {
  /**
   * Get user's membership card (masked)
   * @returns {Promise} - Card details with masked number
   */
  async getMyCard() {
    try {
      const response = await cardAPI.getMyCard();
      return response;
    } catch (error) {
      console.error('Get card error:', error);
      throw error;
    }
  }

  /**
   * Get full card details (unmasked)
   * @returns {Promise} - Complete card details
   */
  async getFullCardDetails() {
    try {
      const response = await cardAPI.getFullCardDetails();
      return response;
    } catch (error) {
      console.error('Get full card error:', error);
      throw error;
    }
  }

  /**
   * Issue a new membership card
   * @returns {Promise} - Newly issued card
   */
  async issueCard() {
    try {
      const response = await cardAPI.issueCard();
      return response;
    } catch (error) {
      console.error('Issue card error:', error);
      throw error;
    }
  }

  /**
   * Format card number for display
   * @param {string} cardNumber - Raw card number
   * @returns {string} - Formatted card number (XXXX XXXX XXXX XXXX)
   */
  formatCardNumber(cardNumber) {
    return cardAPI.formatCardNumber(cardNumber);
  }

  /**
   * Mask card number for security
   * @param {string} cardNumber - Raw card number
   * @returns {string} - Masked card number (•••• •••• •••• 1234)
   */
  maskCardNumber(cardNumber) {
    return cardAPI.maskCardNumber(cardNumber);
  }

  /**
   * Get card type display name
   * @param {string} cardType - Card type from API
   * @returns {string} - Display name
   */
  getCardTypeDisplay(cardType) {
    const types = {
      'premium': 'Premium Black',
      'pro': 'Professional Blue',
      'standard': 'Classic Green',
      'basic': 'Classic Green'
    };
    return types[cardType] || types.standard;
  }

  /**
   * Get card gradient based on plan
   * @param {string} planName - Membership plan name
   * @returns {string} - Tailwind gradient classes
   */
  getCardGradient(planName) {
    if (!planName) return 'from-gray-800 to-gray-900';
    
    const plan = planName.toLowerCase();
    if (plan.includes('premium')) return 'from-purple-800 via-purple-700 to-orange-600';
    if (plan.includes('pro')) return 'from-blue-800 via-blue-700 to-orange-500';
    if (plan.includes('basic')) return 'from-green-800 via-green-700 to-orange-500';
    
    return 'from-gray-800 to-gray-900';
  }

  /**
   * Get card icon based on plan
   * @param {string} planName - Membership plan name
   * @returns {string} - Icon name or class
   */
  getCardIcon(planName) {
    if (!planName) return 'crown';
    
    const plan = planName.toLowerCase();
    if (plan.includes('premium')) return 'strongman';
    if (plan.includes('pro')) return 'bodybalance';
    if (plan.includes('basic')) return 'dumbbell';
    
    return 'crown';
  }

  /**
   * Get card chip color based on plan
   * @param {string} planName - Membership plan name
   * @returns {string} - Chip color class
   */
  getChipColor(planName) {
    if (!planName) return 'from-yellow-400 to-yellow-600';
    
    const plan = planName.toLowerCase();
    if (plan.includes('premium')) return 'from-yellow-500 to-orange-600';
    if (plan.includes('pro')) return 'from-yellow-400 to-blue-500';
    if (plan.includes('basic')) return 'from-yellow-300 to-green-500';
    
    return 'from-yellow-400 to-yellow-600';
  }

  /**
   * Get card expiry status
   * @param {string} expiryDate - Expiry date string
   * @returns {Object} - Status object
   */
  getExpiryStatus(expiryDate) {
    if (!expiryDate) return { status: 'unknown', color: 'text-gray-400' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { status: 'expired', color: 'text-red-500', days: 0 };
    } else if (daysRemaining < 30) {
      return { status: 'expiring', color: 'text-orange-500', days: daysRemaining };
    } else {
      return { status: 'active', color: 'text-green-500', days: daysRemaining };
    }
  }

  /**
   * Format expiry date
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted expiry (MM/YY)
   */
  formatExpiryDate(dateString) {
    if (!dateString) return '••/••';
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  }

  /**
   * Check if card is active
   * @param {Object} card - Card object
   * @returns {boolean} - True if card is active
   */
  isCardActive(card) {
    if (!card) return false;
    return card.is_active === true && card.status !== 'expired';
  }

  /**
   * Get card features based on plan
   * @param {string} planName - Membership plan name
   * @returns {Array} - List of card features
   */
  getCardFeatures(planName) {
    const features = {
      'premium': [
        '24/7 Gym Access',
        'Priority Entry',
        'Guest Passes (4/month)',
        'Premium Locker',
        'Spa Access',
        'Personal Training (4/month)'
      ],
      'pro': [
        '24/7 Gym Access',
        'Guest Passes (2/month)',
        'Standard Locker',
        'Group Classes Unlimited',
        'Personal Training (1/month)'
      ],
      'basic': [
        '24/7 Gym Access',
        'Standard Locker',
        'Group Classes (4/month)',
        'Fitness Assessment'
      ]
    };

    if (!planName) return features.basic;
    
    const plan = planName.toLowerCase();
    if (plan.includes('premium')) return features.premium;
    if (plan.includes('pro')) return features.pro;
    if (plan.includes('basic')) return features.basic;
    
    return features.basic;
  }

  /**
   * Get card color hex values for custom gradients
   * @param {string} planName - Membership plan name
   * @returns {Object} - Color hex values
   */
  getCardColors(planName) {
    const colors = {
      'premium': {
        primary: '#7b1fa2',
        secondary: '#f97316',
        accent: '#facc15',
        text: '#ffffff'
      },
      'pro': {
        primary: '#1e40af',
        secondary: '#f97316',
        accent: '#f59e0b',
        text: '#ffffff'
      },
      'basic': {
        primary: '#047857',
        secondary: '#f97316',
        accent: '#fbbf24',
        text: '#ffffff'
      },
      'standard': {
        primary: '#1f2937',
        secondary: '#f97316',
        accent: '#fbbf24',
        text: '#ffffff'
      }
    };

    if (!planName) return colors.standard;
    
    const plan = planName.toLowerCase();
    if (plan.includes('premium')) return colors.premium;
    if (plan.includes('pro')) return colors.pro;
    if (plan.includes('basic')) return colors.basic;
    
    return colors.standard;
  }

  /**
   * Generate QR code data for card
   * @param {Object} card - Card object
   * @param {Object} user - User object
   * @returns {string} - QR code data string
   */
  generateQRData(card, user) {
    if (!card || !user) return '';
    
    return JSON.stringify({
      type: 'membership',
      cardNumber: card.card_number,
      memberId: user.id,
      name: user.name,
      membershipNumber: card.membership_number,
      expiry: card.expiry_date,
      issued: card.issued_at
    });
  }

  /**
   * Validate card number using Luhn algorithm
   * @param {string} cardNumber - Card number to validate
   * @returns {boolean} - True if valid
   */
  validateCardNumber(cardNumber) {
    if (!cardNumber) return false;
    
    // Remove spaces and non-digits
    const number = cardNumber.replace(/\D/g, '');
    
    if (number.length !== 16) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Get card brand (Visa, Mastercard, etc.)
   * @param {string} cardNumber - Card number
   * @returns {string} - Card brand
   */
  getCardBrand(cardNumber) {
    if (!cardNumber) return 'unknown';
    
    const number = cardNumber.replace(/\D/g, '');
    
    // Mastercard: 51-55, 2221-2720
    if (/^5[1-5]/.test(number) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[0-1]\d|720)/.test(number)) {
      return 'mastercard';
    }
    
    // Visa: 4
    if (/^4/.test(number)) {
      return 'visa';
    }
    
    // American Express: 34, 37
    if (/^3[47]/.test(number)) {
      return 'amex';
    }
    
    return 'unknown';
  }
}

// Create singleton instance
const cardService = new CardService();
export default cardService;