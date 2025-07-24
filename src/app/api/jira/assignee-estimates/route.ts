import axios from 'axios';

// GET /api/jira/assignee-estimates
import { NextRequest } from 'next/server';

// GET /api/jira/assignee-estimates?from=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const JIRA_URL = process.env.JIRA_URL;
  const JIRA_API_KEY = process.env.JIRA_API_KEY;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;

  if (!JIRA_URL || !JIRA_API_KEY || !JIRA_EMAIL) {
    return new Response(JSON.stringify({ error: 'Missing Jira credentials' }), { status: 500 });
  }

  try {
    // Get 'from' date from query params, fallback to current week's Monday
    let from: string | undefined;
    if (req && req.nextUrl) {
    //   from = req.nextUrl.searchParams.get('from') || undefined;
        from = '2025-01-01'
    }
    let monday: Date;
    if (from) {
      monday = new Date(from);
      monday.setHours(0, 0, 0, 0);
    } else {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
    }
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    const weekStart = `${yyyy}-${mm}-${dd}`;

    // JQL: issues in project, with worklogs since 'from' date
    const jql = encodeURIComponent(`project = ${process.env.JIRA_PROJECT} AND worklogDate >= ${weekStart}`);
    // Get up to 100 issues (pagination can be added if needed)
    const response = await axios.get(`${JIRA_URL}/rest/api/3/search?jql=${jql}&fields=assignee,worklog&maxResults=100`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });

    // Aggregate time spent since 'from' date by worklog author
    const issues = response.data.issues || [];
    const userMap: Record<string, number> = {};
    for (const issue of issues) {
      const worklogs = issue.fields.worklog?.worklogs || [];
      for (const log of worklogs) {
        // Only count worklogs from 'from' date
        const started = log.started ? new Date(log.started) : null;
        if (started && started >= monday) {
          const author = log.author?.displayName || 'Unknown';
          const spent = log.timeSpentSeconds || 0;
          if (!userMap[author]) userMap[author] = 0;
          userMap[author] += spent;
        }
      }
    }
    // Convert to array for charting
    const result = Object.entries(userMap).map(([name, seconds]) => ({
      name,
      value: Math.round((seconds as number) / 3600 * 100) / 100 // hours, rounded
    }));
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
