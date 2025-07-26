
import axios from 'axios';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getJiraSettings() {
  const keys = [
    'jira_url',
    'jira_email',
    'jira_api_key',
    'jira_project',
  ];
  const result = await prisma.setting.findMany({ where: { keySetting: { in: keys } } });
  const settings = Object.fromEntries(result.map(row => [row.keySetting, row.valueSetting]));
  return settings;
}

export async function GET(_req: NextRequest) {
  const settings = await getJiraSettings();
  const { jira_url: JIRA_URL, jira_api_key: JIRA_API_KEY, jira_email: JIRA_EMAIL, jira_project: PROJECT_KEY } = settings;

  if (!JIRA_URL || !JIRA_API_KEY || !JIRA_EMAIL) {
    return new Response(JSON.stringify({ error: 'Missing Jira credentials' }), { status: 500 });
  }

  try {
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
