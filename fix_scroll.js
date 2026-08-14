const fs = require('fs');
const path = require('path');

const updateScroll = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
        /messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);/g,
        "messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });"
    );
    fs.writeFileSync(filePath, content, 'utf8');
};

const codeViewerPath = path.join(process.cwd(), 'src/components/projects/viewer/CodeViewer.tsx');
const fallbackViewerPath = path.join(process.cwd(), 'src/components/projects/viewer/FallbackViewer.tsx');

if (fs.existsSync(codeViewerPath)) updateScroll(codeViewerPath);
if (fs.existsSync(fallbackViewerPath)) updateScroll(fallbackViewerPath);

console.log("Updated scrolling behavior to instant");
