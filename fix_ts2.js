const fs = require('fs');
let path = 'src/components/projects/ProjectAnalytics.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\.map\(\(\[date, count\]\) => \(\{ date, count \}\)\)/g,
  `.map(([date, count]) => ({ date, count: count as number }))`
);

content = content.replace(
  /cumulative \+= d\.count;/g,
  `cumulative += d.count as number;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed typescript error 2 in ProjectAnalytics');
