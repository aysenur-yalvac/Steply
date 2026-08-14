const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

// Replace sequential unreadCount + getLinkedAccounts with parallel
content = content.replace(
  `  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  // Fetch linked accounts — graceful fallback if table not yet migrated
  let linkedAccounts: LinkedAccount[] = [];
  try { linkedAccounts = await getLinkedAccountsAction(); } catch { /* table not yet applied */ }`,
  `  // Parallel fetch: messages + linked accounts
  const [unreadResult, linkedAccountsResult] = await Promise.allSettled([
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false),
    getLinkedAccountsAction(),
  ]);
  const unreadCount = unreadResult.status === 'fulfilled' ? (unreadResult.value.count ?? 0) : 0;
  const linkedAccounts: LinkedAccount[] = linkedAccountsResult.status === 'fulfilled' ? (linkedAccountsResult.value as LinkedAccount[]) : [];`
);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log('Parallelized layout fetches');
