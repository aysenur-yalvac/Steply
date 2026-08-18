const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectTabsWrapper.tsx', 'utf8');

content = content.replace(/import React, \{ useState, ReactNode \} from 'react';/, "import React, { useState, useEffect, ReactNode } from 'react';");

fs.writeFileSync('src/components/projects/ProjectTabsWrapper.tsx', content, 'utf8');
console.log("Added useEffect import");
