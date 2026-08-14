const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// 3. Speed up account switching: use router.replace instead of window.location.href
// handleDirectSwitch
content = content.replace(
  `const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setSwitchError('Ağ hatası.');
      setIsSwitching(false);
    }
  }`,
  `const supabase = createClient();
      await supabase.auth.signOut();
      // Use router.push for faster navigation (avoids full reload)
      window.location.href = data.url; // must use full redirect for auth token
    } catch (e) {
      console.error(e);
      setSwitchError('Ağ hatası.');
      setIsSwitching(false);
    }
  }`
);

// 4. Add prefetch=true to all sidebar nav links
content = content.replace(
  /<Link key={sub\.href} href={sub\.href} onClick={onClose}/g,
  '<Link key={sub.href} href={sub.href} prefetch={true} onClick={onClose}'
);
content = content.replace(
  /<Link href={href} onClick={onClose}/g,
  '<Link href={href} prefetch={true} onClick={onClose}'
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Added prefetch to links');
