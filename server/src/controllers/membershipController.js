import MembershipPlan from '../models/MembershipPlan.js';
import MemberMembership from '../models/MemberMembership.js';
import Member from '../models/Members.js';
import Payment from '../models/Payment.js'; // Import Payment model
import { membershipSchemas } from '../utils/validation.js';
import paystackService from '../services/paystackService.js';

// ==================== PUBLIC ROUTES (Get Plans) ====================

// Get all active membership plans (PUBLIC)
export const getAllPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.findAll('active');
        
        // Get REAL active member counts for each plan
        const activeCounts = await MemberMembership.countActiveMembersByPlan();
        
        // Format plans for frontend with REAL data
        const formattedPlans = plans.map(plan => {
            // Calculate trial days based on plan name
            const trialDays = plan.name.toLowerCase().includes('trial') ? 7 : 0;
            
            // Determine if plan is popular (based on member count or explicit flag)
            const activeMembers = activeCounts[plan.id] || 0;
            const isPopular = plan.name === 'Pro' || activeMembers > 50;
            
            // Calculate monthly revenue (active members × monthly price)
            const monthlyRevenue = activeMembers * (parseFloat(plan.price_monthly) || 0);

            return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price_monthly: parseFloat(plan.price_monthly) || 0,
                price_yearly: parseFloat(plan.price_yearly) || 0,
                price: {
                    monthly: parseFloat(plan.price_monthly) || 0,
                    yearly: parseFloat(plan.price_yearly) || 0
                },
                features: plan.features || [],
                highlighted: plan.highlighted || false,
                display_order: plan.display_order || 0,
                status: plan.status || 'active',
                trial_days: trialDays,
                popular: plan.popular || isPopular,
                max_members: plan.max_members || null,
                cancel_anytime: plan.cancel_anytime !== false,
                active_members: activeMembers,
                revenue: monthlyRevenue,
                created_at: plan.created_at,
                updated_at: plan.updated_at
            };
        });

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

// Get single plan by ID (PUBLIC)
export const getPlanById = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Get REAL active member count for this plan
        const activeCounts = await MemberMembership.countActiveMembersByPlan();
        const activeMembers = activeCounts[plan.id] || 0;

        // Calculate trial days
        const trialDays = plan.name.toLowerCase().includes('trial') ? 7 : 0;
        
        // Determine if popular
        const isPopular = plan.name === 'Pro' || activeMembers > 50;

        res.json({
            success: true,
            data: {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price_monthly: parseFloat(plan.price_monthly) || 0,
                price_yearly: parseFloat(plan.price_yearly) || 0,
                price: {
                    monthly: parseFloat(plan.price_monthly) || 0,
                    yearly: parseFloat(plan.price_yearly) || 0
                },
                features: plan.features || [],
                highlighted: plan.highlighted || false,
                display_order: plan.display_order || 0,
                status: plan.status || 'active',
                trial_days: trialDays,
                popular: plan.popular || isPopular,
                max_members: plan.max_members || null,
                cancel_anytime: plan.cancel_anytime !== false,
                active_members: activeMembers,
                revenue: activeMembers * (parseFloat(plan.price_monthly) || 0)
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

// ==================== ADMIN ROUTES ====================

export const getAllPlansAdmin = async (req, res) => {
    try {
        console.log('Fetching all plans for admin...');
        
        const { search, status, minPrice, maxPrice, featured, page = 1, limit = 10 } = req.query;
        console.log('Filters:', { search, status, minPrice, maxPrice, featured, page, limit });
        
        // Get all plans (including inactive)
        const plans = await MembershipPlan.findAllWithInactive();
        console.log(`Found ${plans.length} total plans`);
        
        // Get REAL active member counts for each plan
        const activeCounts = await MemberMembership.countActiveMembersByPlan();
        console.log('Active counts:', activeCounts);
        
        // Apply filters
        let filteredPlans = plans.filter(plan => {
            // Status filter
            if (status && plan.status !== status) return false;
            
            // Featured filter
            if (featured === 'true' && !plan.highlighted) return false;
            if (featured === 'false' && plan.highlighted) return false;
            
            // Price filters
            const monthlyPrice = parseFloat(plan.price_monthly) || 0;
            if (minPrice && monthlyPrice < parseFloat(minPrice)) return false;
            if (maxPrice && monthlyPrice > parseFloat(maxPrice)) return false;
            
            // Search filter
            if (search) {
                const searchLower = search.toLowerCase();
                const nameMatch = plan.name?.toLowerCase().includes(searchLower);
                const descMatch = plan.description?.toLowerCase().includes(searchLower);
                if (!nameMatch && !descMatch) return false;
            }
            
            return true;
        });
        
        console.log(`After filters: ${filteredPlans.length} plans`);
        
        // Format plans
        const formattedPlans = filteredPlans.map(plan => {
            const activeMembers = activeCounts[plan.id] || 0;
            
            return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price_monthly: parseFloat(plan.price_monthly) || 0,
                price_yearly: parseFloat(plan.price_yearly) || 0,
                price: {
                    monthly: parseFloat(plan.price_monthly) || 0,
                    yearly: parseFloat(plan.price_yearly) || 0
                },
                features: plan.features || [],
                highlighted: plan.highlighted || false,
                display_order: plan.display_order || 0,
                status: plan.status,
                trial_days: plan.trial_days || (plan.name?.toLowerCase().includes('trial') ? 7 : 0),
                popular: plan.popular || false,
                max_members: plan.max_members || null,
                cancel_anytime: plan.cancel_anytime !== false,
                active_members: activeMembers,
                revenue: activeMembers * (parseFloat(plan.price_monthly) || 0),
                created_at: plan.created_at,
                updated_at: plan.updated_at
            };
        });

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;
        
        const paginatedPlans = formattedPlans.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                plans: paginatedPlans,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: formattedPlans.length,
                    totalPages: Math.ceil(formattedPlans.length / limitNum)
                }
            }
        });

    } catch (error) {
        console.error('❌ ERROR in getAllPlansAdmin:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all membership plans',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ==================== MEMBERSHIP PURCHASE & MANAGEMENT ====================

// Purchase membership with Paystack
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

        const member_id = req.user.id;
        const { plan_id, billing_cycle, auto_renew } = value;

        // Get member details
        const member = await Member.findById(member_id);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        // Get plan details
        const plan = await MembershipPlan.findById(plan_id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Calculate price
        const amount = billing_cycle === 'monthly' 
            ? parseFloat(plan.price_monthly) 
            : parseFloat(plan.price_yearly);

        // Generate unique reference
        const reference = `PAY-${Date.now()}-${member_id}-${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record FIRST (pending)
        const payment = await Payment.create({
            reference,
            member_id,
            amount,
            metadata: {
                plan_id,
                plan_name: plan.name,
                billing_cycle,
                auto_renew,
                member_name: `${member.first_name} ${member.last_name}`,
                member_email: member.email
            }
        });

        console.log('💳 Payment record created:', payment.id);

        // Initialize Paystack transaction with payment reference in metadata
        const paystackResponse = await paystackService.initializeTransaction({
            email: member.email,
            amount,
            metadata: {
                payment_id: payment.id,
                payment_reference: reference,
                member_id,
                plan_id,
                billing_cycle,
                auto_renew,
                membership_type: plan.name,
                member_name: `${member.first_name} ${member.last_name}`
            }
        });

        res.json({
            success: true,
            message: 'Redirect to payment',
            data: {
                authorization_url: paystackResponse.authorization_url,
                reference: paystackResponse.reference,
                payment_id: payment.id
            }
        });

    } catch (error) {
        console.error('Purchase membership error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment'
        });
    }
};

// Handle Paystack payment callback
export const handlePaymentCallback = async (req, res) => {
    try {
        const { reference, trxref } = req.query;
        const paystackRef = reference || trxref;
        
        console.log('📞 Callback received with query:', req.query);
        console.log('💰 Paystack reference:', paystackRef);
        
        if (!paystackRef) {
            console.log('❌ No reference in callback');
            return res.redirect(`${process.env.APP_URL}/membership/failed`);
        }

        // Verify transaction with Paystack FIRST to get metadata
        console.log('🔍 Verifying transaction with Paystack...');
        const verification = await paystackService.verifyTransaction(paystackRef);
        console.log('📊 Paystack verification response:', verification.data);
        
        // Get our internal payment reference from metadata
        const internalRef = verification.data.metadata?.payment_reference;
        
        if (!internalRef) {
            console.log('❌ No internal payment reference in metadata');
            return res.redirect(`${process.env.APP_URL}/membership/failed`);
        }

        console.log('🔍 Finding payment by internal reference:', internalRef);
        
        // Find payment using our internal reference
        const existingPayment = await Payment.findByReference(internalRef);
        console.log('📝 Existing payment:', existingPayment);
        
        if (!existingPayment) {
            console.log('❌ Payment record not found for internal reference:', internalRef);
            return res.redirect(`${process.env.APP_URL}/membership/failed`);
        }

        if (existingPayment.status === 'success') {
            console.log('✅ Payment already processed, redirecting to success');
            return res.redirect(`${process.env.APP_URL}/membership/success?reference=${internalRef}`);
        }

        if (verification.data.status === 'success') {
            const { member_id, plan_id, billing_cycle, auto_renew } = verification.data.metadata;
            
            // Calculate price
            const plan = await MembershipPlan.findById(plan_id);
            const price_paid = billing_cycle === 'monthly' 
                ? parseFloat(plan.price_monthly) 
                : parseFloat(plan.price_yearly);

            // Check if membership already exists
            const existingMembership = await MemberMembership.getActiveByMemberId(member_id);
            
            let membership;
            if (existingMembership) {
                membership = await MemberMembership.update(existingMembership.id, {
                    plan_id,
                    billing_cycle,
                    price_paid,
                    auto_renew,
                    status: 'active'
                });
                console.log('🔄 Updated existing membership:', membership.id);
            } else {
                membership = await MemberMembership.purchase({
                    member_id,
                    plan_id,
                    billing_cycle,
                    price_paid,
                    auto_renew
                });
                console.log('✅ Created new membership:', membership.id);
            }

            // Update payment record with success data
            const updatedPayment = await Payment.updateAfterSuccess(internalRef, {
                transaction_id: verification.data.id,
                payment_method: verification.data.authorization.channel,
                channel: verification.data.authorization.channel,
                membership_id: membership.id,
                paystack_data: verification.data
            });
            console.log('💳 Payment record updated:', updatedPayment);

            return res.redirect(`${process.env.APP_URL}/membership/success?reference=${internalRef}`);
        } else {
            console.log('❌ Payment verification failed:', verification.data.status);
            
            await Payment.updateAfterFailure(internalRef, {
                message: verification.data.gateway_response,
                status: verification.data.status,
                paystack_data: verification.data
            });
            
            return res.redirect(`${process.env.APP_URL}/membership/failed`);
        }
    } catch (error) {
        console.error('❌ Payment callback error:', error);
        return res.redirect(`${process.env.APP_URL}/membership/failed`);
    }
};

// Handle Paystack webhook
export const handlePaystackWebhook = async (req, res) => {
    try {
        // Get the Paystack signature from headers
        const signature = req.headers['x-paystack-signature'];
        
        // Verify signature
        const isValid = paystackService.verifyWebhookSignature(signature, req.body);
        
        if (!isValid) {
            console.log('❌ Invalid webhook signature');
            return res.status(401).send('Invalid signature');
        }

        // Parse the event
        const event = req.body;
        console.log('📨 Webhook received:', event.event);

        // Handle different event types
        switch(event.event) {
            case 'charge.success':
                console.log('✅ Payment successful:', event.data.reference);
                
                // Get internal reference from metadata
                const internalRef = event.data.metadata?.payment_reference;
                
                if (!internalRef) {
                    console.log('❌ No internal payment reference in metadata');
                    return res.sendStatus(200);
                }
                
                // Find payment using internal reference
                const existingPayment = await Payment.findByReference(internalRef);
                
                if (!existingPayment) {
                    console.log('❌ Payment record not found for reference:', internalRef);
                    return res.sendStatus(200);
                }

                if (existingPayment.status === 'success') {
                    console.log('⚠️ Duplicate webhook - payment already processed');
                    return res.sendStatus(200);
                }

                const { member_id, plan_id, billing_cycle, auto_renew } = event.data.metadata;
                
                // Calculate price
                const plan = await MembershipPlan.findById(plan_id);
                const price_paid = billing_cycle === 'monthly' 
                    ? parseFloat(plan.price_monthly) 
                    : parseFloat(plan.price_yearly);

                // CHECK FOR EXISTING MEMBERSHIP (prevent duplicate membership)
                const existingMembership = await MemberMembership.getActiveByMemberId(member_id);
                
                let membership;
                if (existingMembership) {
                    // Update existing membership
                    membership = await MemberMembership.update(existingMembership.id, {
                        plan_id,
                        billing_cycle,
                        price_paid,
                        auto_renew,
                        status: 'active'
                    });
                    console.log('🔄 Updated existing membership:', membership.id);
                } else {
                    // Create new membership
                    membership = await MemberMembership.purchase({
                        member_id,
                        plan_id,
                        billing_cycle,
                        price_paid,
                        auto_renew
                    });
                    console.log('✅ Created new membership:', membership.id);
                }

                // Update payment record with success data
                await Payment.updateAfterSuccess(internalRef, {
                    transaction_id: event.data.id,
                    payment_method: event.data.authorization.channel,
                    channel: event.data.authorization.channel,
                    membership_id: membership.id,
                    paystack_data: event.data
                });

                console.log('💳 Payment record updated successfully');
                
                break;
                
            case 'charge.failed':
                console.log('❌ Payment failed:', event.data.reference);
                
                // Get internal reference from metadata
                const failureInternalRef = event.data.metadata?.payment_reference;
                
                if (failureInternalRef) {
                    // Update payment record as failed using internal reference
                    await Payment.updateAfterFailure(failureInternalRef, {
                        message: event.data.gateway_response,
                        status: event.data.status,
                        paystack_data: event.data
                    });
                }
                
                break;
                
            case 'subscription.create':
                console.log('📅 Subscription created:', event.data.subscription_code);
                break;
                
            case 'subscription.disable':
                console.log('⏸️ Subscription disabled:', event.data.subscription_code);
                break;
                
            default:
                console.log('ℹ️ Unhandled event:', event.event);
        }

        // Always return 200 OK
        res.sendStatus(200);
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};

// Get current user's active membership
export const getMyMembership = async (req, res) => {
    try {
        const membership = await MemberMembership.getActiveByMemberId(req.user.id);

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
                status: isExpired ? 'expired' : membership.status,
                auto_renew: membership.auto_renew,
                features: membership.features,
                days_remaining: daysRemaining > 0 ? daysRemaining : 0,
                
                // Trial-specific fields
                isTrial,
                trial_ends: isTrial ? membership.end_date : null,
                trial_expired: isExpired,
                requires_upgrade: isExpired
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
            req.user.id,
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
            req.user.id,
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
            req.user.id
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
            req.user.id,
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

// ==================== ADMIN ROUTES (continued) ====================

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

        // Format the response with all fields
        const formattedPlan = {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price_monthly: parseFloat(plan.price_monthly) || 0,
            price_yearly: parseFloat(plan.price_yearly) || 0,
            price: {
                monthly: parseFloat(plan.price_monthly) || 0,
                yearly: parseFloat(plan.price_yearly) || 0
            },
            features: plan.features || [],
            highlighted: plan.highlighted || false,
            display_order: plan.display_order || 0,
            status: plan.status || 'active',
            trial_days: plan.trial_days || (plan.name.toLowerCase().includes('trial') ? 7 : 0),
            popular: plan.popular || false,
            max_members: plan.max_members || null,
            cancel_anytime: plan.cancel_anytime !== false,
            active_members: 0,
            revenue: 0,
            created_at: plan.created_at,
            updated_at: plan.updated_at
        };

        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            data: formattedPlan
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

        // Get REAL active member count for this plan
        const activeCounts = await MemberMembership.countActiveMembersByPlan();
        const activeMembers = activeCounts[plan.id] || 0;

        // Format the response with all fields
        const formattedPlan = {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price_monthly: parseFloat(plan.price_monthly) || 0,
            price_yearly: parseFloat(plan.price_yearly) || 0,
            price: {
                monthly: parseFloat(plan.price_monthly) || 0,
                yearly: parseFloat(plan.price_yearly) || 0
            },
            features: plan.features || [],
            highlighted: plan.highlighted || false,
            display_order: plan.display_order || 0,
            status: plan.status || 'active',
            trial_days: plan.trial_days || (plan.name.toLowerCase().includes('trial') ? 7 : 0),
            popular: plan.popular || false,
            max_members: plan.max_members || null,
            cancel_anytime: plan.cancel_anytime !== false,
            active_members: activeMembers,
            revenue: activeMembers * (parseFloat(plan.price_monthly) || 0),
            created_at: plan.created_at,
            updated_at: plan.updated_at
        };

        res.json({
            success: true,
            message: 'Plan updated successfully',
            data: formattedPlan
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

