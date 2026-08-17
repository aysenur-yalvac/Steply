const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// Update getNotificationsAction
const getNotifRegex = /export async function getNotificationsAction\(\): Promise<Notification\[\]> \{([\s\S]*?)if \(error\) return \[\];\s*return \(data \|\| \[\]\) as Notification\[\];/;

const newGetNotif = `export async function getNotificationsAction(): Promise<(Notification & { project_deleted?: boolean })[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Join projects table to check if project exists
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, is_read, related_id, created_at, projects!left(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return [];
  
  return (data || []).map((n: any) => {
    // If it's a project-related notification but the project is gone
    const project_deleted = (n.type === 'project' || n.type === 'message' || n.type === 'project_added') && n.related_id && !n.projects;
    
    // Auto-mark as read if project is deleted
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      is_read: project_deleted ? true : n.is_read,
      related_id: n.related_id,
      created_at: n.created_at,
      project_deleted: project_deleted
    };
  }) as any;`;

content = content.replace(getNotifRegex, newGetNotif);

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Updated getNotificationsAction in actions.ts");
