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

    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    const weekStart = `${yyyy}-${mm}-${dd}`;

    // JQL: issues in project, with worklogs since 'from' date, including parent field
    const jql = encodeURIComponent(`project = ${JIRA_PROJECT} AND worklogDate >= ${weekStart}`);
    const response = await axios.get(`${JIRA_URL}/rest/api/3/search?jql=${jql}&fields=summary,worklog,parent&maxResults=100`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });

    // Aggregate time spent since 'from' date by parent Epic
    const issues = response.data.issues || [];
    const epicMap: Record<string, { name: string, seconds: number }> = {};
    for (const issue of issues) {
      let epicKey = 'No Epic';
      let epicName = 'No Epic';
      if (issue.fields.parent && issue.fields.parent.fields && issue.fields.parent.fields.issuetype?.name === 'Epic') {
        epicKey = issue.fields.parent.key;
        epicName = issue.fields.parent.fields.summary || epicKey;
      }
      const worklogs = issue.fields.worklog?.worklogs || [];
      for (const log of worklogs) {
        const started = log.started ? new Date(log.started) : null;
        if (started && started >= monday) {
          const spent = log.timeSpentSeconds || 0;
          if (!epicMap[epicKey]) epicMap[epicKey] = { name: epicName, seconds: 0 };
          epicMap[epicKey].seconds += spent;
        }
      }
    }
    // Convert to array for charting
    const result = Object.values(epicMap).map(({ name, seconds }) => ({
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
