const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// Replace .from("projects").select(something) with .from("projects").select(something).is("deleted_at", null)
// But we only want to do this where it makes sense, e.g. getting list of projects.
// Let's find getProjectsAction. Wait, we don't have a getProjectsAction? Let's check for "export async function getAllProjectsAction" or similar.
const matches = [...content.matchAll(/export async function get[A-Za-z]+Action\(/g)];
console.log("Found getters:", matches.map(m => m[0]));
