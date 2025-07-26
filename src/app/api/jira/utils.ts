import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAndValidateJiraCredentials(requiredKeys: string[] = ['jira_url', 'jira_email', 'jira_api_key']) {
  const result = await prisma.setting.findMany({ where: { keySetting: { in: requiredKeys } } });
  const settings = Object.fromEntries(result.map(row => [row.keySetting, row.valueSetting]));
  const missing = requiredKeys.filter(key => !settings[key]);
  if (missing.length > 0) {
    return { error: `Missing Jira credentials: ${missing.join(', ')}` };
  }
  return settings;
}
