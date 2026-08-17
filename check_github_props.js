const fs = require('fs');

let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const regex = /export default function GitHubIntegrationCard\([\s\S]*?\{[\s\S]*?\)/;
console.log(content.match(regex)[0]);
