const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/AssignmentListClient.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `export default function AssignmentListClient({
  assignments,
  userRole,
}: {
  assignments: Assignment[];
  userRole: string;
}) {`,
  `export default function AssignmentListClient({
  assignments,
  userRole,
  teacherClasses = [],
}: {
  assignments: Assignment[];
  userRole: string;
  teacherClasses?: { id: string; name: string }[];
}) {`
);

content = content.replace(
  `{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}`,
  `{isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} teacherClasses={teacherClasses} />}`
);

// We need to also render class badge on assignment card if class_id is present
content = content.replace(
  `<h3 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {assignment.title}
                    </h3>`,
  `<h3 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {assignment.title}
                    </h3>
                    {assignment.class?.name && (
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {assignment.class.name}
                      </span>
                    )}`
);


fs.writeFileSync(file, content, 'utf8');
