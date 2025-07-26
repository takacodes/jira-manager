
import axios from 'axios';
import { NextRequest } from 'next/server';
import { getAndValidateJiraCredentials } from '../utils';

export async function GET(_req: NextRequest) {
  const settings = await getAndValidateJiraCredentials(['jira_url', 'jira_email', 'jira_api_key', 'jira_project']);
  if ('error' in settings) {
    return new Response(JSON.stringify({ error: settings.error }), { status: 500 });
  }
  const { jira_url: JIRA_URL, jira_api_key: JIRA_API_KEY, jira_email: JIRA_EMAIL, jira_project: project } = settings;

  try {
    if (!project) {
      return new Response(JSON.stringify({ error: 'Missing Jira project name' }), { status: 500 });
    }
    const jql = encodeURIComponent(`project = ${project} ORDER BY updated DESC`);
    const response = await axios.get(`${JIRA_URL}/rest/api/3/search?jql=${jql}&fields=summary,status,assignee,updated,timetracking`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
