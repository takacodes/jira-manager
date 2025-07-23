import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest) {
  const JIRA_URL = process.env.JIRA_URL;
  const JIRA_API_KEY = process.env.JIRA_API_KEY;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;

  if (!JIRA_URL || !JIRA_API_KEY || !JIRA_EMAIL) {
    return new Response(JSON.stringify({ error: 'Missing Jira credentials' }), { status: 500 });
  }

  try {
    // Get recent updates (activity stream)
    const response = await axios.get(`${JIRA_URL}/rest/api/3/search?jql=order+by+updated+DESC&maxResults=10`, {
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
