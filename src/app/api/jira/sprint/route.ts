
import axios from 'axios';
import { NextRequest } from 'next/server';
import { getAndValidateJiraCredentials } from '../utils';

export async function GET(_req: NextRequest) {
  const settings = await getAndValidateJiraCredentials();
  if ('error' in settings) {
    return new Response(JSON.stringify({ error: settings.error }), { status: 500 });
  }
  const { jira_url: JIRA_URL, jira_api_key: JIRA_API_KEY, jira_email: JIRA_EMAIL } = settings;

  try {
    // Get all sprints for the first board (as an example)
    const boardRes = await axios.get(`${JIRA_URL}/rest/agile/1.0/board`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });
    const boardId = boardRes.data.values[0]?.id;
    if (!boardId) throw new Error('No boards found');
    const sprintRes = await axios.get(`${JIRA_URL}/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });
    const sprint = sprintRes.data.values[0];
    return new Response(JSON.stringify(sprint), { status: 200 });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
