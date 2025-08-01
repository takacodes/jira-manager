import axios from 'axios';
import { NextRequest } from 'next/server';
import { getAndValidateJiraCredentials } from '../utils';

export async function GET(req: NextRequest) {
  const settings = await getAndValidateJiraCredentials(['jira_url', 'jira_email', 'jira_api_key', 'jira_project']);
  if ('error' in settings) {
    return new Response(JSON.stringify({ error: settings.error }), { status: 500 });
  }
  const { jira_url: JIRA_URL, jira_api_key: JIRA_API_KEY, jira_email: JIRA_EMAIL, jira_project: JIRA_PROJECT } = settings;

  try {
    // Get 'from' date from query params, fallback to current week's Monday
    // const from = req?.nextUrl?.searchParams.get('from');
    const from = '2025-01-01'; // Example date, replace with actual logic to get 'from' date
    const date = from ? new Date(from) : new Date();

    // Calculate Monday of the week, if the from param is empty or invalid
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    const weekStart = `${yyyy}-${mm}-${dd}`;

    // JQL: issues in project, with worklogs since 'from' date
    const jql = encodeURIComponent(`project = ${JIRA_PROJECT} AND worklogDate >= ${weekStart}`);
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
