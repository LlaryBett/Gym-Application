// middleware/trialMiddleware.js
import MemberMembership from '../models/MemberMembership.js';

export const checkTrialExpiry = async (req, res, next) => {
    try {
        if (!req.session?.user?.id) {
            return next();
        }

        const trialStatus = await MemberMembership.checkTrialExpiry(req.session.user.id);
        req.trialStatus = trialStatus;
        
        if (trialStatus.isTrial && trialStatus.isExpired) {
            // Don't block membership routes (so user can upgrade)
            if (!req.path.includes('/api/membership')) {
                return res.status(403).json({
                    success: false,
                    message: 'Your free trial has ended. Please upgrade to continue.',
                    requiresUpgrade: true,
                    redirectTo: '/membership'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Trial check error:', error);
        next();
    }
};