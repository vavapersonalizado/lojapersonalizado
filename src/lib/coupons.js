import prisma from "@/lib/prisma";

/**
 * Generate a unique coupon code
 * @param {string} prefix - Prefix for the code (e.g., WELCOME)
 * @returns {string} - Unique code (e.g., WELCOME-A1B2)
 */
function generateCode(prefix) {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${randomPart}`;
}

/**
 * Generate an automatic coupon for a user based on a rule type
 * @param {string} userId - ID of the user
 * @param {string} ruleType - Type of the rule (e.g., 'FIRST_PURCHASE')
 */
export async function generateAutomaticCoupon(userId, ruleType) {
    try {
        // 1. Find active rule
        const rule = await prisma.couponRule.findUnique({
            where: { type: ruleType },
        });

        if (!rule || !rule.active) {
            console.log(`No active coupon rule found for type: ${ruleType}`);
            return null;
        }

        // 2. Check if user already has a system generated coupon of this type (optional, depending on logic)
        // For FIRST_PURCHASE, we might want to ensure they don't already have one.
        // But for now, let's assume the trigger (createUser) only happens once.

        // 3. Generate unique code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = generateCode(rule.codePrefix);
            const existing = await prisma.coupon.findUnique({ where: { code } });
            if (!existing) isUnique = true;
        }

        // 4. Calculate expiration
        let expiresAt = null;
        if (rule.expirationDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + rule.expirationDays);
        }

        // 5. Create Coupon
        const coupon = await prisma.coupon.create({
            data: {
                code,
                discount: rule.discountValue,
                type: rule.discountType,
                userId,
                isSystemGenerated: true,
                expiresAt,
                isActive: true,
                cumulative: false, // Usually welcome coupons are not cumulative
            },
        });

        console.log(`Generated automatic coupon ${code} for user ${userId}`);
        return coupon;

    } catch (error) {
        console.error("Error generating automatic coupon:", error);
        return null;
    }
}
