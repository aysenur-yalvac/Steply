const fs = require('fs');
const path = require('path');

let fp = path.join(process.cwd(), 'src/components/projects/SmartFileViewerModal.tsx');
let content = fs.readFileSync(fp, 'utf8');

// Import saveFileDrawingsAction
if (!content.includes('saveFileDrawingsAction')) {
  content = content.replace(
    /import \{ saveFileAnnotationAction \} from '@\/lib\/actions';/,
    "import { saveFileAnnotationAction, saveFileDrawingsAction } from '@/lib/actions';"
  );
}

// Update handleSaveAnnotation
const oldSaveCall = "const res = await saveFileAnnotationAction(projectId, file.url, stagedAnnotation);";
const newSaveCall = `
      let res;
      if (stagedAnnotation.type === 'drawing') {
        res = await saveFileDrawingsAction(projectId, file.url, stagedAnnotation.lines);
      } else {
        res = await saveFileAnnotationAction(projectId, file.url, stagedAnnotation);
      }
`;
if (content.includes(oldSaveCall)) {
  content = content.replace(oldSaveCall, newSaveCall);
  fs.writeFileSync(fp, content, 'utf8');
  console.log("Updated SmartFileViewerModal to use saveFileDrawingsAction");
}
