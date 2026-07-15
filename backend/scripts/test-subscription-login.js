const { PrismaClient } = require('@prisma/client');

const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const PASSWORD = 'password123';
const prisma = new PrismaClient();

async function login(email, tenantId) {
  const headers = { 'Content-Type': 'application/json' };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const json = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    code: json?.error?.code || null,
    message: json?.error?.message || json?.message || null,
    user: json?.data?.user || null,
    token: json?.data?.accessToken || null,
  };
}

async function getMe(token, tenantId) {
  const headers = { Authorization: `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  const res = await fetch(`${API}/auth/me`, { headers });
  const json = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    code: json?.error?.code || null,
    message: json?.error?.message || null,
    subscription: json?.data?.subscription || null,
  };
}

async function hitProtected(token, tenantId, path) {
  const headers = { Authorization: `Bearer ${token}` };
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  const res = await fetch(`${API}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    code: json?.error?.code || null,
    message: json?.error?.message || null,
  };
}

function periodEnd(sub) {
  if (!sub) return null;
  const status = String(sub.status || '').toUpperCase();
  if ((status === 'TRIALING' || status === 'TRIAL') && sub.trialEnd) return new Date(sub.trialEnd);
  return sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
}

function isExpired(sub) {
  if (!sub) return true;
  const status = String(sub.status || '').toUpperCase();
  if (['CANCELED', 'CANCELLED', 'EXPIRED', 'UNPAID', 'INACTIVE', 'PAST_DUE'].includes(status)) return true;
  if (!['ACTIVE', 'TRIALING', 'TRIAL'].includes(status)) return true;
  const end = periodEnd(sub);
  return !!(end && end.getTime() < Date.now());
}

async function main() {
  const results = [];

  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    include: {
      subscriptions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      users: {
        where: {
          deletedAt: null,
          role: { name: { in: ['OWNER', 'AREA_MANAGER', 'MANAGER'] } },
        },
        take: 1,
        include: { role: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  console.log('\n========== SUBSCRIPTION SNAPSHOT ==========');
  for (const t of tenants) {
    const sub = t.subscriptions[0] || null;
    const email = t.users[0]?.email || '(no staff user)';
    console.log(
      `${t.name} | status=${t.status} | plan=${sub?.planTier || 'NONE'} | subStatus=${sub?.status || 'NONE'} | expired=${isExpired(sub)} | user=${email}`
    );
  }

  console.log('\n========== LOGIN TESTS (CURRENT STATE) ==========');
  for (const t of tenants) {
    const user = t.users[0];
    if (!user) continue;
    const sub = t.subscriptions[0] || null;
    const expectedOk = t.status !== 'SUSPENDED' && t.status !== 'CANCELLED' && !isExpired(sub);
    const result = await login(user.email, t.id);
    const pass = result.ok === expectedOk;
    results.push({ case: `login:${t.slug || t.name}`, pass, expectedOk, result });
    console.log(
      `${pass ? 'PASS' : 'FAIL'} | ${user.email} @ ${t.name} | expected=${expectedOk ? 'ALLOW' : 'BLOCK'} | got=${result.ok ? 'ALLOW' : `BLOCK(${result.status}:${result.code})`} | ${result.message || ''}`
    );

    if (result.ok && result.token) {
      const me = await getMe(result.token, t.id);
      console.log(
        `       /me => ${me.ok ? 'OK' : `FAIL ${me.status}`} plan=${me.subscription?.planTier} features=${(me.subscription?.features || []).length} expired=${me.subscription?.isExpired}`
      );
      const ops = await hitProtected(result.token, t.id, '/ops/expenses?limit=1');
      console.log(
        `       /ops/expenses => ${ops.ok ? 'OK' : `BLOCK ${ops.status}:${ops.code}`} ${ops.message || ''}`
      );
    }
  }

  // Super admin should always login
  console.log('\n========== SUPER ADMIN ==========');
  const sa = await login('superadmin@restaurantops.com', null);
  const saPass = sa.ok === true;
  results.push({ case: 'superadmin', pass: saPass, expectedOk: true, result: sa });
  console.log(
    `${saPass ? 'PASS' : 'FAIL'} | superadmin | expected=ALLOW | got=${sa.ok ? 'ALLOW' : `BLOCK(${sa.status})`}`
  );

  // Expire one active tenant temporarily and verify block, then restore
  const candidate = tenants.find(
    (t) => t.users[0] && t.subscriptions[0] && !isExpired(t.subscriptions[0]) && t.status === 'ACTIVE'
  );

  if (candidate) {
    const sub = candidate.subscriptions[0];
    const email = candidate.users[0].email;
    console.log(`\n========== FORCE-EXPIRE TEST: ${candidate.name} (${email}) ==========`);
    const backup = {
      status: sub.status,
      trialEnd: sub.trialEnd,
      currentPeriodEnd: sub.currentPeriodEnd,
    };

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'EXPIRED',
        trialEnd: new Date('2020-01-01'),
        currentPeriodEnd: new Date('2020-01-01'),
      },
    });

    const blocked = await login(email, candidate.id);
    const blockPass = blocked.ok === false && (blocked.status === 402 || blocked.code === 'SUBSCRIPTION_EXPIRED');
    results.push({ case: 'force-expire-login', pass: blockPass, expectedOk: false, result: blocked });
    console.log(
      `${blockPass ? 'PASS' : 'FAIL'} | expired login blocked | got=${blocked.ok ? 'ALLOW' : `BLOCK(${blocked.status}:${blocked.code})`} | ${blocked.message || ''}`
    );

    // Restore
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: backup.status,
        trialEnd: backup.trialEnd,
        currentPeriodEnd: backup.currentPeriodEnd,
      },
    });

    const restored = await login(email, candidate.id);
    const restorePass = restored.ok === true;
    results.push({ case: 'restore-login', pass: restorePass, expectedOk: true, result: restored });
    console.log(
      `${restorePass ? 'PASS' : 'FAIL'} | after restore | got=${restored.ok ? 'ALLOW' : `BLOCK(${restored.status}:${restored.code})`}`
    );

    // Also test suspended tenant if any, else temporarily suspend
    console.log(`\n========== SUSPEND TEST: ${candidate.name} ==========`);
    const tenantBackup = candidate.status;
    await prisma.tenant.update({ where: { id: candidate.id }, data: { status: 'SUSPENDED' } });
    const sus = await login(email, candidate.id);
    const susPass = sus.ok === false && (sus.status === 403 || sus.code === 'TENANT_INACTIVE');
    results.push({ case: 'suspend-login', pass: susPass, expectedOk: false, result: sus });
    console.log(
      `${susPass ? 'PASS' : 'FAIL'} | suspended login blocked | got=${sus.ok ? 'ALLOW' : `BLOCK(${sus.status}:${sus.code})`} | ${sus.message || ''}`
    );
    await prisma.tenant.update({ where: { id: candidate.id }, data: { status: tenantBackup } });
    const unsus = await login(email, candidate.id);
    console.log(
      `${unsus.ok ? 'PASS' : 'FAIL'} | after unsuspend | got=${unsus.ok ? 'ALLOW' : `BLOCK(${unsus.status})`}`
    );
    results.push({ case: 'unsuspend-login', pass: unsus.ok === true, expectedOk: true, result: unsus });
  } else {
    console.log('\n(No active tenant with staff user found for force-expire test)');
  }

  const failed = results.filter((r) => !r.pass);
  console.log('\n========== SUMMARY ==========');
  console.log(`Total: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  if (failed.length) {
    for (const f of failed) {
      console.log(` - FAIL ${f.case}: ${JSON.stringify(f.result)}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All subscription login checks passed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
