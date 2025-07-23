
import axios from 'axios';

import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest) {
  // Example: Fetch Jira projects
  const JIRA_URL = process.env.JIRA_URL;
  const JIRA_API_KEY = process.env.JIRA_API_KEY;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;

  if (!JIRA_URL || !JIRA_API_KEY || !JIRA_EMAIL) {
    return new Response(JSON.stringify({ error: 'Missing Jira credentials' }), { status: 500 });
  }

  try {
    const PROJECT_KEY = process.env.JIRA_PROJECT;
    const response = await axios.get(`${JIRA_URL}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_KEY}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });
    // Filter projects by key PROJECT_KEY only, with proper typing
    interface JiraProject {
      id: string;
      key: string;
      name: string;
      [key: string]: unknown;
    }
    const projects: JiraProject[] = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.values)
        ? response.data.values
        : [];
    const filtered = projects.filter((proj) => proj.key === PROJECT_KEY);
    return new Response(JSON.stringify(filtered), { status: 200 });
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
