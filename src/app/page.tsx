"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { JiraUser, JiraIssue, JiraBravoIssues } from '../types/jira';

function useBravoIssues() {
  return useQuery<JiraBravoIssues>({
    queryKey: ['issues'],
    queryFn: async () => (await axios.get('/api/jira/issues')).data,
  });
}

export default function Dashboard() {
  const { data, isLoading } = useBravoIssues();
  const issues = data?.issues || [];

  // Group issues by assignee
  const assigneeMap: Record<string, { user?: JiraUser; issues: JiraIssue[] }> = {};
  issues.forEach((issue) => {
    const assignee = issue.fields.assignee?.displayName || 'Unassigned';
    if (!assigneeMap[assignee]) assigneeMap[assignee] = { user: issue.fields.assignee, issues: [] };
    assigneeMap[assignee].issues.push(issue);
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans p-0 m-0 transition-colors duration-300" style={{ fontFamily: 'Inter, Geist, Arial, sans-serif' }}>
      <main className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-10">
        <section className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] shadow flex flex-col gap-4">
          <h2 className="font-semibold text-lg mb-2 text-[var(--accent)]">All Issues</h2>
          {isLoading ? (
            <div className="animate-pulse h-6 w-2/3 bg-[var(--border)] rounded" />
          ) : issues.length === 0 ? (
            <div className="text-[var(--subtext)]">No issues found</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--background)]/60">
                  <th className="p-2 text-left w-32">Key</th>
                  <th className="p-2 text-left">Summary</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Assignee</th>
                  <th className="p-2 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-[var(--border)]">
                    <td className="p-2 font-mono text-[var(--accent)]">
                      <a
                        href={`${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline cursor-pointer"
                      >
                        {issue.key}
                      </a>
                    </td>
                    <td className="p-2">{issue.fields.summary}</td>
                    <td className="p-2">{issue.fields.status?.name}</td>
                    <td className="p-2">{issue.fields.assignee?.displayName || 'Unassigned'}</td>
                    <td className="p-2">{new Date(issue.fields.updated).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <footer className="w-full text-center py-6 text-xs text-[var(--subtext)]">Jira Dashboard &copy; {new Date().getFullYear()}</footer>
      </main>
    </div>
  );
}
