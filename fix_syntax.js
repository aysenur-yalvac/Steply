const fs = require('fs');

const files = [
    'src/components/projects/ProjectNotes.tsx',
    'src/components/school/SchoolStudentPanel.tsx',
    'src/components/school/TeacherGrid.tsx',
    'src/components/social/ChatWindow.tsx',
    'src/components/ui/AnimatedProgressBar.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/className= dark:bg-none"/g, 'className="');
        content = content.replace(/\{expanded \?  dark:bg-none"Daha az göster"/g, '{expanded ? "Daha az göster"');
        content = content.replace(/ dark:bg-none"/g, '"');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed syntax in", file);
    }
}
