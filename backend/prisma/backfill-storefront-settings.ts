import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updates = [
    {
      slug: 'spice-haven-kitchen',
      appName: 'Spice Haven Kitchen',
      homeBannerTitle: 'Spice Haven Kitchen',
      homeBannerSubtitle: 'Bold Indian flavours — order online and book a table.',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      coffeeHouseCaption: 'Spice Haven · Digital storefront',
      findUsAddress: '12th Main, Indiranagar, Bengaluru 560038',
      findUsPhone: '+918012345001',
      findUsEmail: 'indiranagar@spicehaven.com',
    },
    {
      slug: 'ocean-bistro',
      appName: 'Ocean Bistro',
      homeBannerTitle: 'Ocean Bistro',
      homeBannerSubtitle: 'Coastal seafood in Santa Monica — reserve your table.',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      coffeeHouseCaption: 'Ocean Bistro · Digital storefront',
      findUsAddress: '1440 Ocean Ave, Santa Monica, CA 90401',
      findUsPhone: '+13105550110',
      findUsEmail: 'santamonica@oceanbistro.com',
    },
    {
      slug: 'green-leaf-cafe',
      appName: 'Green Leaf Cafe',
      homeBannerTitle: 'Green Leaf Cafe',
      homeBannerSubtitle: 'Plant-forward bowls and juices in Shoreditch.',
      currency: 'GBP',
      timezone: 'Europe/London',
      coffeeHouseCaption: 'Green Leaf · Wellness cafe',
      findUsAddress: '88 Brick Lane, London E1 6RL',
      findUsPhone: '+442079460123',
      findUsEmail: 'shoreditch@greenleafcafe.co.uk',
    },
  ];

  for (const u of updates) {
    const t = await prisma.tenant.findFirst({ where: { slug: u.slug } });
    if (!t) {
      console.log('Skip missing', u.slug);
      continue;
    }
    const { slug, ...settings } = u;
    await prisma.tenantSettings.upsert({
      where: { tenantId: t.id },
      update: {
        ...settings,
        footerContent: `© 2026 ${settings.appName}. Powered by Tastyc.`,
        platformHighlights: 'Fresh ingredients, Warm hospitality, Fast digital ordering',
        highlightsTitle: 'Why dine with us',
        highlightsDescription: 'Guest experience',
        hoursOfService: 'Monday - Sunday: 10:00 AM - 10:00 PM',
      },
      create: {
        tenantId: t.id,
        ...settings,
        footerContent: `© 2026 ${settings.appName}. Powered by Tastyc.`,
        platformHighlights: 'Fresh ingredients, Warm hospitality, Fast digital ordering',
        highlightsTitle: 'Why dine with us',
        highlightsDescription: 'Guest experience',
        hoursOfService: 'Monday - Sunday: 10:00 AM - 10:00 PM',
      },
    });
    console.log('Updated settings for', u.slug);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
