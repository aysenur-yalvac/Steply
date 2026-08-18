const fs = require('fs');

// 1. Update ProjectTabsWrapper.tsx
let wrapperContent = fs.readFileSync('src/components/projects/ProjectTabsWrapper.tsx', 'utf8');

const oldInterface = /interface ProjectTabsWrapperProps \{[\s\S]*?\}/;
const newInterface = `interface ProjectTabsWrapperProps {
  overviewContent: ReactNode;
  teamContent?: ReactNode;
  milestonesContent?: ReactNode;
  filesContent?: ReactNode;
  notesContent?: ReactNode;
  showNotesTab: boolean;
  hasNotes?: boolean;
  projectId?: string;
  currentUserId?: string;
  projectNotes?: any[];
  reviews?: any[];
}`;
wrapperContent = wrapperContent.replace(oldInterface, newInterface);

const oldProps = /export default function ProjectTabsWrapper\(\{[\s\S]*?\}\: ProjectTabsWrapperProps\) \{/;
const newProps = `export default function ProjectTabsWrapper({
  overviewContent,
  teamContent,
  milestonesContent,
  filesContent,
  notesContent,
  showNotesTab,
  hasNotes,
  projectId,
  currentUserId,
  projectNotes = [],
  reviews = [],
}: ProjectTabsWrapperProps) {`;
wrapperContent = wrapperContent.replace(oldProps, newProps);

const stateAndEffect = `  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hasViewedNotes, setHasViewedNotes] = useState(false);
  const [hasUnreadNotes, setHasUnreadNotes] = useState(false);

  useEffect(() => {
    if (!projectId || typeof window === 'undefined') return;

    // Check if there are notes/reviews from OTHERS
    const othersNotes = projectNotes.filter((n: any) => n.user_id !== currentUserId);
    const othersReviews = reviews.filter((r: any) => r.reviewer_id !== currentUserId);
    
    if (othersNotes.length === 0 && othersReviews.length === 0) {
      setHasUnreadNotes(false);
      return;
    }

    const latestNoteTime = Math.max(
      ...othersNotes.map((n: any) => new Date(n.created_at).getTime()),
      ...othersReviews.map((r: any) => new Date(r.created_at).getTime()),
      0
    );

    const lastReadStr = localStorage.getItem(\`project_read_\${projectId}\`);
    const lastReadTime = lastReadStr ? new Date(lastReadStr).getTime() : 0;

    if (latestNoteTime > lastReadTime) {
      setHasUnreadNotes(true);
    }
  }, [projectId, currentUserId, projectNotes, reviews]);

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    if (id === 'notes') {
      setHasViewedNotes(true);
      setHasUnreadNotes(false);
      if (projectId && typeof window !== 'undefined') {
        localStorage.setItem(\`project_read_\${projectId}\`, new Date().toISOString());
      }
    }
  };`;

const oldState = `  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hasViewedNotes, setHasViewedNotes] = useState(false);`;
wrapperContent = wrapperContent.replace(oldState, stateAndEffect);

const oldTabClick = /onClick=\{\(\) => \{\s*setActiveTab\(tab\.id as TabType\);\s*if \(tab\.id === 'notes'\) setHasViewedNotes\(true\);\s*\}\}/;
const newTabClick = `onClick={() => handleTabClick(tab.id as TabType)}`;
wrapperContent = wrapperContent.replace(oldTabClick, newTabClick);

const oldBadge = /\{tab\.id === 'notes' && hasNotes && !hasViewedNotes && activeTab !== 'notes' && \(\s*<span className="absolute top-3 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" \/>\s*\)\}/;
const newBadge = `{tab.id === 'notes' && hasUnreadNotes && activeTab !== 'notes' && (
                <span className="absolute top-3 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}`;
wrapperContent = wrapperContent.replace(oldBadge, newBadge);

fs.writeFileSync('src/components/projects/ProjectTabsWrapper.tsx', wrapperContent, 'utf8');
console.log("Updated ProjectTabsWrapper.tsx");


// 2. Update page.tsx to pass new props
let pageContent = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');
const oldWrapper = `<ProjectTabsWrapper
              showNotesTab={isTeamMember || isTeacher}
              hasNotes={projectNotes.length > 0 || reviews.length > 0}`;
const newWrapper = `<ProjectTabsWrapper
              showNotesTab={isTeamMember || isTeacher}
              hasNotes={projectNotes.length > 0 || reviews.length > 0}
              projectId={project.id}
              currentUserId={user.id}
              projectNotes={projectNotes}
              reviews={reviews}`;
pageContent = pageContent.replace(oldWrapper, newWrapper);

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', pageContent, 'utf8');
console.log("Updated page.tsx");
