import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const keys = [
    'jira_url',
    'jira_email',
    'jira_api_key',
    'jira_project',
    'jira_filter_id',
  ];
  const result = await prisma.setting.findMany({
    where: { keySetting: { in: keys } },
  });
  const settings = Object.fromEntries(result.map(row => [row.keySetting, row.valueSetting]));
  return new Response(JSON.stringify(settings), { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const keys = [
    'jira_url',
    'jira_email',
    'jira_api_key',
    'jira_project',
    'jira_filter_id',
  ];
  for (const key of keys) {
    if (key in body) {
      await prisma.setting.upsert({
        where: { keySetting: key },
        update: { valueSetting: body[key] },
        create: { keySetting: key, valueSetting: body[key] },
      });
    }
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
