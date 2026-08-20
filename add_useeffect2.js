const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useEffect')) {
  content = content.replace(
    /import \{ useState, useTransition, useRef \} from "react";/,
    `import { useState, useTransition, useRef, useEffect } from "react";`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed useEffect import');
