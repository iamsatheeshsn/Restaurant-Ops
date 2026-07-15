import { SubscriptionTier, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../middleware/error';

export type ActiveSubscription = {
  id: string;
  tenantId: string;
  planTier: SubscriptionTier;
  status: string;
  maxBranches: number;
  maxEmployees: number;
  currentPeriodEnd: Date;
  trialEnd: Date | null;
};

const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING', 'TRIAL']);

export function defaultLimitsForTier(tier: SubscriptionTier): { maxBranches: number; maxEmployees: number } {
  switch (tier) {
    case SubscriptionTier.ENTERPRISE:
      return { maxBranches: 100, maxEmployees: 500 };
    case SubscriptionTier.GROWTH:
      return { maxBranches: 5, maxEmployees: 50 };
    case SubscriptionTier.STARTER:
    default:
      return { maxBranches: 1, maxEmployees: 10 };
  }
}

export async function resolvePlanTier(
  input: { planId?: string; planTier?: string } | null | undefined
): Promise<{ tier: SubscriptionTier; maxBranches: number; maxEmployees: number; planName?: string }> {
  const requestedTier = (input?.planTier || '').toUpperCase();
  const allowed = Object.values(SubscriptionTier) as string[];

  if (input?.planId) {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: input.planId, isActive: true },
    });
    if (!plan) {
      throw new AppError('Subscription plan not found or inactive', 404, 'PLAN_NOT_FOUND');
    }
    return {
      tier: plan.tier,
      maxBranches: plan.maxBranches,
      maxEmployees: plan.maxEmployees,
      planName: plan.name,
    };
  }

  const tier = (allowed.includes(requestedTier) ? requestedTier : SubscriptionTier.STARTER) as SubscriptionTier;
  const catalog = await prisma.subscriptionPlan.findFirst({
    where: { tier, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  const defaults = defaultLimitsForTier(tier);
  return {
    tier,
    maxBranches: catalog?.maxBranches ?? defaults.maxBranches,
    maxEmployees: catalog?.maxEmployees ?? defaults.maxEmployees,
    planName: catalog?.name,
  };
}

export async function createTenantSubscription(
  tx: Prisma.TransactionClient | typeof prisma,
  args: {
    tenantId: string;
    tier: SubscriptionTier;
    maxBranches: number;
    maxEmployees: number;
    tenantStatus?: string;
  }
) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const isTrial = !args.tenantStatus || args.tenantStatus === 'TRIAL';
  const trialEnd = isTrial ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) : null;

  return tx.subscription.create({
    data: {
      tenantId: args.tenantId,
      planTier: args.tier,
      status: isTrial ? 'TRIALING' : 'ACTIVE',
      trialStart: isTrial ? now : null,
      trialEnd,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      maxBranches: args.maxBranches,
      maxEmployees: args.maxEmployees,
    },
  });
}

export async function getActiveSubscription(tenantId: string | null | undefined): Promise<ActiveSubscription | null> {
  if (!tenantId) return null;

  let subscription = await prisma.subscription.findFirst({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  // Soft backfill: older tenants created before plan assignment still need an entitlement row.
  if (!subscription) {
    const defaults = defaultLimitsForTier(SubscriptionTier.STARTER);
    subscription = await createTenantSubscription(prisma, {
      tenantId,
      tier: SubscriptionTier.STARTER,
      maxBranches: defaults.maxBranches,
      maxEmployees: defaults.maxEmployees,
      tenantStatus: 'ACTIVE',
    });
  }

  return {
    id: subscription.id,
    tenantId: subscription.tenantId,
    planTier: subscription.planTier,
    status: subscription.status,
    maxBranches: subscription.maxBranches,
    maxEmployees: subscription.maxEmployees,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEnd: subscription.trialEnd,
  };
}

export function subscriptionPeriodEnd(sub: ActiveSubscription): Date | null {
  const status = String(sub.status || '').toUpperCase();
  if ((status === 'TRIALING' || status === 'TRIAL') && sub.trialEnd) return sub.trialEnd;
  return sub.currentPeriodEnd || null;
}

export function isSubscriptionExpired(sub: ActiveSubscription | null): boolean {
  if (!sub) return true;
  const status = String(sub.status || '').toUpperCase();
  if (['CANCELED', 'CANCELLED', 'EXPIRED', 'UNPAID', 'INCOMPLETE_EXPIRED', 'INACTIVE', 'VOID', 'PAST_DUE'].includes(status)) {
    return true;
  }
  if (!ACTIVE_STATUSES.has(status)) {
    return true;
  }
  const end = subscriptionPeriodEnd(sub);
  return !!(end && end.getTime() < Date.now());
}

export function assertSubscriptionUsable(sub: ActiveSubscription | null): ActiveSubscription {
  if (!sub) {
    throw new AppError(
      'No active subscription plan for this restaurant. Contact platform support.',
      402,
      'SUBSCRIPTION_REQUIRED'
    );
  }

  const status = String(sub.status || '').toUpperCase();
  if (isSubscriptionExpired(sub)) {
    throw new AppError(
      status === 'TRIALING' || status === 'TRIAL'
        ? 'Your trial period has ended. Please renew or upgrade the subscription plan.'
        : 'Your restaurant subscription plan has expired. Renew the plan to continue using the application.',
      402,
      'SUBSCRIPTION_EXPIRED'
    );
  }

  return sub;
}

export async function getEnabledFeatureKeys(planTier: SubscriptionTier): Promise<string[]> {
  const flags = await prisma.planFeatureFlag.findMany({
    where: { planTier, enabled: true },
    select: { featureKey: true },
  });
  return flags.map((f) => f.featureKey);
}

export async function tenantHasFeature(tenantId: string, featureKey: string): Promise<boolean> {
  const sub = await getActiveSubscription(tenantId);
  if (!sub) return false;
  try {
    assertSubscriptionUsable(sub);
  } catch {
    return false;
  }
  const flag = await prisma.planFeatureFlag.findUnique({
    where: {
      planTier_featureKey: {
        planTier: sub.planTier,
        featureKey,
      },
    },
  });
  // If no flag row exists, default deny for known gated features; allow unknown keys only if we find any flags?
  // Prefer deny when flag missing so unseeded keys don't silently open.
  if (!flag) return false;
  return !!flag.enabled;
}

export async function assertFeatureEnabled(tenantId: string, featureKey: string) {
  const sub = assertSubscriptionUsable(await getActiveSubscription(tenantId));
  const ok = await tenantHasFeature(tenantId, featureKey);
  if (!ok) {
    throw new AppError(
      `Feature "${featureKey}" is not included in the ${sub.planTier} plan.`,
      403,
      'FEATURE_NOT_AVAILABLE'
    );
  }
  return sub;
}

/** Staff seats exclude CUSTOMER and SUPER_ADMIN. */
export async function assertEmployeeLimit(tenantId: string) {
  const sub = assertSubscriptionUsable(await getActiveSubscription(tenantId));
  const count = await prisma.user.count({
    where: {
      tenantId,
      deletedAt: null,
      role: { name: { notIn: ['CUSTOMER', 'SUPER_ADMIN'] } },
    },
  });
  if (count >= sub.maxEmployees) {
    throw new AppError(
      `Employee limit reached (${sub.maxEmployees}) for the ${sub.planTier} plan.`,
      403,
      'EMPLOYEE_LIMIT_REACHED'
    );
  }
  return sub;
}

export async function assertBranchLimit(tenantId: string) {
  const sub = assertSubscriptionUsable(await getActiveSubscription(tenantId));
  const count = await prisma.branch.count({
    where: { tenantId, deletedAt: null },
  });

  if (count >= sub.maxBranches) {
    throw new AppError(
      `Branch limit reached (${sub.maxBranches}) for the ${sub.planTier} plan.`,
      403,
      'BRANCH_LIMIT_REACHED'
    );
  }

  // Creating a 2nd+ branch also requires multi_branch feature
  if (count >= 1) {
    const flag = await prisma.planFeatureFlag.findUnique({
      where: {
        planTier_featureKey: {
          planTier: sub.planTier,
          featureKey: 'multi_branch',
        },
      },
    });
    if (flag && !flag.enabled) {
      throw new AppError(
        `Multi-branch is not included in the ${sub.planTier} plan. Upgrade to add more locations.`,
        403,
        'FEATURE_NOT_AVAILABLE'
      );
    }
    if (!flag) {
      // No flag row: still block second branch on STARTER defaults
      if (sub.planTier === SubscriptionTier.STARTER) {
        throw new AppError(
          'Multi-branch is not included in the STARTER plan. Upgrade to add more locations.',
          403,
          'FEATURE_NOT_AVAILABLE'
        );
      }
    }
  }

  return sub;
}

export async function getTenantEntitlements(tenantId: string | null | undefined) {
  if (!tenantId) {
    return {
      planTier: null as SubscriptionTier | null,
      status: null as string | null,
      maxBranches: null as number | null,
      maxEmployees: null as number | null,
      features: [] as string[],
      currentPeriodEnd: null as string | null,
      isActive: true,
      isExpired: false,
    };
  }

  const sub = await getActiveSubscription(tenantId);
  if (!sub) {
    return {
      planTier: null,
      status: null,
      maxBranches: null,
      maxEmployees: null,
      features: [],
      currentPeriodEnd: null,
      isActive: false,
      isExpired: true,
    };
  }

  const expired = isSubscriptionExpired(sub);
  const features = expired ? [] : await getEnabledFeatureKeys(sub.planTier);
  const periodEnd = subscriptionPeriodEnd(sub);
  return {
    planTier: sub.planTier,
    status: expired ? 'EXPIRED' : sub.status,
    maxBranches: sub.maxBranches,
    maxEmployees: sub.maxEmployees,
    features,
    currentPeriodEnd: periodEnd?.toISOString?.() || null,
    isActive: !expired,
    isExpired: expired,
  };
}

/** Ensure tenant account + subscription are allowed to use the SaaS app. */
export async function assertTenantAccessAllowed(tenantId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, deletedAt: null },
    select: { id: true, status: true, name: true },
  });
  if (!tenant) {
    throw new AppError('Restaurant tenant not found', 404, 'TENANT_NOT_FOUND');
  }
  if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
    throw new AppError(
      `This restaurant account is ${tenant.status.toLowerCase()}. Contact platform support.`,
      403,
      'TENANT_INACTIVE'
    );
  }
  assertSubscriptionUsable(await getActiveSubscription(tenantId));
  return tenant;
}
