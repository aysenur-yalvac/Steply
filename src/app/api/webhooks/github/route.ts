
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const payload = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: repo } = await admin.from('project_github_repos').select('webhook_secret').eq('project_id', projectId).single();

    if (!repo) {
      return NextResponse.json({ error: 'Repo not configured for this project' }, { status: 404 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', repo.webhook_secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    if (signature !== digest) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event === 'push') {
      const data = JSON.parse(payload);
      const commits = data.commits || [];
      
      const commitRecords = commits.map((c: any) => ({
        project_id: projectId,
        commit_hash: c.id,
        commit_message: c.message,
        author_name: c.author.name,
        author_avatar: c.author.username ? `https://github.com/${c.author.username}.png` : null,
        commit_url: c.url,
        pushed_at: c.timestamp,
      }));

      if (commitRecords.length > 0) {
        await admin.from('project_commits').insert(commitRecords);
        await admin.from('projects').update({ updated_at: new Date().toISOString() }).eq('id', projectId);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
