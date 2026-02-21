import MembershipPlan from '../models/MembershipPlan.js';
import MemberMembership from '../models/MemberMembership.js';
import { membershipSchemas } from '../utils/validation.js';

// ==================== PUBLIC ROUTES (Get Plans) ====================

// Get all active membership plans
export const getAllPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.findAll('active');
        
        // Format plans for frontend
        const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: {
                monthly: parseFloat(plan.price_monthly),
                yearly: parseFloat(plan.price_yearly)
            },
            features: plan.features,
            highlighted: plan.highlighted,
            display_order: plan.display_order
        }));

        res.json({
            success: true,
            data: formattedPlans
        });

    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch membership plans'
        });
    }
};

// Get single plan by ID
export const getPlanById = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: {
                    monthly: parseFloat(plan.price_monthly),
                    yearly: parseFloat(plan.price_yearly)
                },
                features: plan.features,
                highlighted: plan.highlighted
            }
        });

    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch plan'
        });
    }
};

// ==================== MEMBERSHIP PURCHASE & MANAGEMENT ====================

// Purchase membership
export const purchaseMembership = async (req, res) => {
    try {
        const { error, value } = membershipSchemas.purchase.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { plan_id, billing_cycle, auto_renew } = value;
        const member_id = req.session.user.id;

        // Get plan details
        const plan = await MembershipPlan.findById(plan_id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Calculate price
        const price_paid = billing_cycle === 'monthly' 
            ? parseFloat(plan.price_monthly) 
            : parseFloat(plan.price_yearly);

        // Purchase membership
        const membership = await MemberMembership.purchase({
            member_id,
            plan_id,
            billing_cycle,
            price_paid,
            auto_renew
        });

        res.status(201).json({
            success: true,
            message: 'Membership purchased successfully',
            data: {
                id: membership.id,
                membership_number: membership.membership_number,
                plan_name: plan.name,
                billing_cycle: membership.billing_cycle,
                price_paid: membership.price_paid,
                start_date: membership.start_date,
                end_date: membership.end_date,
                status: membership.status
            }
        });

    } catch (error) {
        console.error('Purchase membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase membership',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user's active membership
export const getMyMembership = async (req, res) => {
    try {
        const membership = await MemberMembership.getActiveByMemberId(req.session.user.id);

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'No active membership found'
            });
        }

        // Calculate days remaining
        const today = new Date();
        const endDate = new Date(membership.end_date);
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        // Check if this is a trial membership
        const isTrial = membership.plan_name === '7-Day Free Trial' || membership.billing_cycle === 'trial';
        
        // Check if trial is expired
        const isExpired = isTrial ? today > endDate : false;

        res.json({
            success: true,
            data: {
                id: membership.id,
                membership_number: membership.membership_number,
                plan_id: membership.plan_id,
                plan_name: membership.plan_name,
                billing_cycle: membership.billing_cycle,
                price_paid: parseFloat(membership.price_paid),
                start_date: membership.start_date,
                end_date: membership.end_date,
                status: isExpired ? 'expired' : membership.status, // Show expired if trial ended
                auto_renew: membership.auto_renew,
                features: membership.features,
                days_remaining: daysRemaining > 0 ? daysRemaining : 0,
                
                // ✅ NEW TRIAL-SPECIFIC FIELDS
                isTrial,
                trial_ends: isTrial ? membership.end_date : null,
                trial_expired: isExpired,
                requires_upgrade: isExpired // Helper for frontend
            }
        });

    } catch (error) {
        console.error('Get my membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch membership'
        });
    }
};

// Get user's membership history
export const getMyMembershipHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await MemberMembership.findByMemberId(
            req.session.user.id,
            page,
            limit
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get membership history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch membership history'
        });
    }
};

// Cancel membership
export const cancelMembership = async (req, res) => {
    try {
        const { error, value } = membershipSchemas.cancel.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const membership = await MemberMembership.cancel(
            req.params.id,
            req.session.user.id,
            value.reason
        );

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        res.json({
            success: true,
            message: 'Membership cancelled successfully',
            data: {
                id: membership.id,
                membership_number: membership.membership_number,
                status: membership.status,
                cancelled_at: membership.cancelled_at
            }
        });

    } catch (error) {
        console.error('Cancel membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel membership'
        });
    }
};

// Toggle auto-renew
export const toggleAutoRenew = async (req, res) => {
    try {
        const membership = await MemberMembership.toggleAutoRenew(
            req.params.id,
            req.session.user.id
        );

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        res.json({
            success: true,
            message: `Auto-renew ${membership.auto_renew ? 'enabled' : 'disabled'} successfully`,
            data: {
                id: membership.id,
                auto_renew: membership.auto_renew
            }
        });

    } catch (error) {
        console.error('Toggle auto-renew error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle auto-renew'
        });
    }
};

// Change plan (upgrade/downgrade)
export const changePlan = async (req, res) => {
    try {
        const { error, value } = membershipSchemas.changePlan.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { new_plan_id, new_billing_cycle } = value;
        
        // Get new plan details
        const newPlan = await MembershipPlan.findById(new_plan_id);
        if (!newPlan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Calculate price
        const pricePaid = new_billing_cycle === 'monthly'
            ? parseFloat(newPlan.price_monthly)
            : parseFloat(newPlan.price_yearly);

        const membership = await MemberMembership.changePlan(
            req.params.id,
            req.session.user.id,
            new_plan_id,
            new_billing_cycle,
            pricePaid
        );

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan changed successfully',
            data: {
                id: membership.id,
                plan_id: membership.plan_id,
                plan_name: newPlan.name,
                billing_cycle: membership.billing_cycle,
                price_paid: membership.price_paid
            }
        });

    } catch (error) {
        console.error('Change plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change plan'
        });
    }
};

// ==================== ADMIN ROUTES ====================

// Create new plan (admin)
export const createPlan = async (req, res) => {
    try {
        const { error, value } = membershipSchemas.plan.create.validate(req.body, {
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

        const plan = await MembershipPlan.create(value);

        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            data: plan
        });

    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create plan'
        });
    }
};

// Update plan (admin)
export const updatePlan = async (req, res) => {
    try {
        const { error, value } = membershipSchemas.plan.update.validate(req.body, {
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

        const plan = await MembershipPlan.update(req.params.id, value);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan updated successfully',
            data: plan
        });

    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update plan'
        });
    }
};

// Delete plan (admin - soft delete)
export const deletePlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.delete(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan deleted successfully',
            data: {
                id: plan.id,
                name: plan.name
            }
        });

    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete plan'
        });
    }
};

// Get all active memberships (admin)
export const getAllActiveMemberships = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await MemberMembership.findAllActive(page, limit);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get all memberships error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch memberships'
        });
    }
};

// Get membership statistics (admin)
export const getMembershipStats = async (req, res) => {
    try {
        const stats = await MemberMembership.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get membership stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch membership statistics'
        });
    }
};

// Process renewals (admin - cron job)
export const processRenewals = async (req, res) => {
    try {
        const count = await MemberMembership.processRenewals();

        res.json({
            success: true,
            message: `Processed ${count} renewals successfully`
        });

    } catch (error) {
        console.error('Process renewals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process renewals'
        });
    }
};