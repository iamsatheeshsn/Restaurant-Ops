/**
 * Seed platform-level SaaS catalog data (plans, flags, integrations, tax, backups, etc.).
 * Safe to re-run: skips when rows already exist for each catalog.
 *
 * Usage: npx ts-node prisma/seed-platform.ts
 *    or: npm run prisma:seed-platform
 */
import { PrismaClient, SubscriptionTier, IntegrationChannel, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPlatformData(client: PrismaClient = prisma) {
  console.log('Seeding platform catalog data...');

  const planCount = await client.subscriptionPlan.count();
  if (planCount === 0) {
    await client.subscriptionPlan.createMany({
      data: [
        {
          name: 'Starter',
          tier: SubscriptionTier.STARTER,
          priceMonthly: 49,
          maxBranches: 1,
          maxEmployees: 10,
          features: {
            pos: true,
            inventory: true,
            kds: true,
            multiBranch: false,
            advancedReports: false,
          },
          isActive: true,
        },
        {
          name: 'Growth',
          tier: SubscriptionTier.GROWTH,
          priceMonthly: 129,
          maxBranches: 5,
          maxEmployees: 50,
          features: {
            pos: true,
            inventory: true,
            kds: true,
            multiBranch: true,
            advancedReports: true,
            delivery: true,
          },
          isActive: true,
        },
        {
          name: 'Enterprise',
          tier: SubscriptionTier.ENTERPRISE,
          priceMonthly: 349,
          maxBranches: 100,
          maxEmployees: 500,
          features: {
            pos: true,
            inventory: true,
            kds: true,
            multiBranch: true,
            advancedReports: true,
            delivery: true,
            apiAccess: true,
            dedicatedSupport: true,
            customIntegrations: true,
          },
          isActive: true,
        },
      ],
    });
    console.log('  + subscription plans');
  }

  const flagCount = await client.planFeatureFlag.count();
  if (flagCount === 0) {
    const featureKeys = [
      'pos',
      'inventory',
      'kds',
      'multi_branch',
      'advanced_reports',
      'delivery',
      'api_access',
      'loyalty',
      'catering',
    ];
    const tierMatrix: Record<SubscriptionTier, string[]> = {
      STARTER: ['pos', 'inventory', 'kds', 'loyalty'],
      GROWTH: ['pos', 'inventory', 'kds', 'multi_branch', 'advanced_reports', 'delivery', 'loyalty', 'catering'],
      ENTERPRISE: featureKeys,
    };
    const rows = (Object.keys(tierMatrix) as SubscriptionTier[]).flatMap((tier) =>
      featureKeys.map((featureKey) => ({
        planTier: tier,
        featureKey,
        enabled: tierMatrix[tier].includes(featureKey),
      }))
    );
    await client.planFeatureFlag.createMany({ data: rows });
    console.log('  + plan feature flags');
  }

  const integrationCount = await client.platformIntegration.count();
  if (integrationCount === 0) {
    await client.platformIntegration.createMany({
      data: [
        {
          name: 'Transactional Email (SMTP)',
          channel: IntegrationChannel.EMAIL,
          isActive: true,
          config: { provider: 'smtp', from: 'noreply@tastyc.com', region: 'us-east-1' },
        },
        {
          name: 'SMS Gateway',
          channel: IntegrationChannel.SMS,
          isActive: true,
          config: { provider: 'twilio', senderId: 'TASTYC' },
        },
        {
          name: 'WhatsApp Business',
          channel: IntegrationChannel.WHATSAPP,
          isActive: false,
          config: { provider: 'meta', status: 'pending_verification' },
        },
        {
          name: 'Card Payments',
          channel: IntegrationChannel.PAYMENT,
          isActive: true,
          config: { provider: 'stripe', mode: 'test' },
        },
      ],
    });
    console.log('  + platform integrations');
  }

  const taxCount = await client.globalTaxSetting.count();
  if (taxCount === 0) {
    await client.globalTaxSetting.createMany({
      data: [
        { country: 'United States', taxName: 'Sales Tax', rate: 8.875, isDefault: true },
        { country: 'United Kingdom', taxName: 'VAT', rate: 20, isDefault: false },
        { country: 'India', taxName: 'GST', rate: 18, isDefault: false },
        { country: 'UAE', taxName: 'VAT', rate: 5, isDefault: false },
      ],
    });
    console.log('  + global tax settings');
  }

  const backupCount = await client.backupPolicy.count();
  if (backupCount === 0) {
    await client.backupPolicy.createMany({
      data: [
        {
          name: 'Nightly full backup',
          frequency: 'DAILY',
          retentionDays: 30,
          isActive: true,
          lastRunAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          name: 'Weekly archive',
          frequency: 'WEEKLY',
          retentionDays: 90,
          isActive: true,
          lastRunAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('  + backup policies');
  }

  const announcementCount = await client.systemAnnouncement.count();
  if (announcementCount === 0) {
    await client.systemAnnouncement.createMany({
      data: [
        {
          title: 'Welcome to Tastyc Platform Admin',
          body: 'Use this console to manage tenants, billing, feature flags, and platform integrations.',
          audience: 'SUPER_ADMIN',
          isActive: true,
          startsAt: new Date(),
        },
        {
          title: 'Scheduled maintenance window',
          body: 'Platform maintenance is planned every Sunday 02:00–04:00 UTC. Expect brief read-only periods.',
          audience: 'ALL',
          isActive: true,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('  + system announcements');
  }

  const brandingCount = await client.platformBranding.count();
  if (brandingCount === 0) {
    await client.platformBranding.create({
      data: {
        appName: 'Restaurant Ops',
        logo: null,
        favicon: null,
      },
    });
    console.log('  + platform branding');
  }

  const tenant = await client.tenant.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } });

  const invoiceCount = await client.invoice.count();
  if (invoiceCount === 0 && tenant) {
    await client.invoice.createMany({
      data: [
        {
          tenantId: tenant.id,
          amount: 129,
          currency: 'USD',
          status: 'PAID',
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          paidAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          description: 'Growth plan — previous billing period',
        },
        {
          tenantId: tenant.id,
          amount: 129,
          currency: 'USD',
          status: 'OPEN',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          description: 'Growth plan — current billing period',
        },
      ],
    });
    console.log('  + sample invoices');
  }

  const ticketCount = await client.supportTicket.count();
  if (ticketCount === 0) {
    await client.supportTicket.createMany({
      data: [
        {
          tenantId: tenant?.id ?? null,
          subject: 'Unable to add a second branch',
          description: 'Owner reports Growth plan should allow 5 branches but UI blocks creation.',
          status: TicketStatus.OPEN,
          priority: 'HIGH',
          requesterEmail: 'owner@tastyc.com',
          assigneeName: 'Platform Support',
        },
        {
          tenantId: tenant?.id ?? null,
          subject: 'Invoice PDF download',
          description: 'Requesting PDF copies of the last 3 invoices for accounting.',
          status: TicketStatus.IN_PROGRESS,
          priority: 'MEDIUM',
          requesterEmail: 'accountant@tastyc.com',
          assigneeName: 'Billing Desk',
        },
        {
          tenantId: null,
          subject: 'API access request',
          description: 'Prospect asking about Enterprise API rate limits before signing up.',
          status: TicketStatus.OPEN,
          priority: 'LOW',
          requesterEmail: 'prospect@example.com',
          assigneeName: null,
        },
      ],
    });
    console.log('  + support tickets');
  }

  const apiKeyCount = await client.apiKeyRecord.count();
  if (apiKeyCount === 0) {
    await client.apiKeyRecord.create({
      data: {
        name: 'Platform read-only demo key',
        keyPrefix: 'pk_demo_',
        keyHash: '$2a$10$platformDemoKeyHashPlaceholder000000000000000000000u',
        tenantId: null,
        createdBy: 'seed',
      },
    });
    console.log('  + API key record');
  }

  console.log('Platform catalog seed complete.');
}

async function main() {
  await seedPlatformData();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
