const fs = require("fs");

// Update dashboard page.tsx
let dashContent = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
let changed = false;

// Add .is('deleted_at', null) filter after .from('projects') + .select
// We need to find the pattern: .from('projects')\n...(whitespace).select(
// and add .is('deleted_at', null) to the query chain

// Strategy: find all supabase.from('projects').select and add the filter
// The filter should be added before .eq() or .order() or .limit()
// Simpler: add after every .select('..projects query..')

// Common patterns to find and update:
// 1) .from('projects').select('...').eq(...) -> .from('projects').select('...').is('deleted_at', null).eq(...)
// 2) .from('projects').select('...').order(...) -> add filter before order

// Replace .from('projects') queries that don't have deleted_at filter
const patterns = [
  // Match select for projects (not mentored_projects or project_types)
  /\.from\('projects'\)\s*\n\s*\.select\('([^']+)'\)\s*\n\s*\.(eq|order|limit|in|filter|not)/g
];

const newDash = dashContent.replace(
  /\.from\('projects'\)\s*(\r?\n\s*)\.select\('([^']+)'\)\s*(\r?\n\s*)\.(eq|order|limit)/g,
  `.from('projects')$1.select('$2')$3.is('deleted_at', null)$3.$4`
);

if (newDash !== dashContent) {
  fs.writeFileSync("src/app/dashboard/page.tsx", newDash, "utf8");
  console.log("dashboard/page.tsx updated with deleted_at filter");
} else {
  console.log("No matching pattern found in dashboard/page.tsx - checking...");
  // Find all from('projects')
  const matches = [...dashContent.matchAll(/\.from\('projects'\)/g)];
  console.log(`Found ${matches.length} instances of .from('projects')`);
  matches.forEach(m => {
    console.log("At index:", m.index, "Context:", dashContent.substring(m.index, m.index + 150).replace(/\n/g, "\\n"));
  });
}

// Update all-projects page
let allProjects = fs.readFileSync("src/app/all-projects/page.tsx", "utf8");
const newAll = allProjects.replace(
  /\.from\('projects'\)\s*(\r?\n\s*)\.select\('([^']+)'\)\s*(\r?\n\s*)\.(eq|order|limit)/g,
  `.from('projects')$1.select('$2')$3.is('deleted_at', null)$3.$4`
);
if (newAll !== allProjects) {
  fs.writeFileSync("src/app/all-projects/page.tsx", newAll, "utf8");
  console.log("all-projects/page.tsx updated with deleted_at filter");
}
