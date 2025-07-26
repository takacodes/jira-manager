
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
    // Get all boards (for sprints)
    const response = await axios.get(`${JIRA_URL}/rest/agile/1.0/board`, {
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
