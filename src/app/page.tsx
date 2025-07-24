"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
interface JiraUser {
  displayName: string;
  emailAddress?: string;
  avatarUrls?: { [size: string]: string };
}
interface JiraStatus {
  name: string;
}
interface JiraTimeTracking {
  timeSpent?: string;
  timeSpentSeconds?: number;
  [key: string]: unknown;
}
interface JiraIssueFields {
  summary: string;
  status: JiraStatus;
  assignee?: JiraUser;
  updated: string;
  timetracking?: JiraTimeTracking;
}
interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
}
interface JiraBravoIssues {
  issues: JiraIssue[];
}
function useBravoIssues() {
  return useQuery<JiraBravoIssues>({
    queryKey: ['bravo-issues'],
    queryFn: async () => (await axios.get('/api/jira/bravo-issues')).data,
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
                    <td className="p-2 font-mono text-[var(--accent)]">{issue.key}</td>
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

        {/* Personnel and Time Tracking */}
        <section className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] shadow flex flex-col gap-4">
          <h2 className="font-semibold text-lg mb-2 text-[var(--accent)]">Personnel & Time Tracking</h2>
          {isLoading ? (
            <div className="animate-pulse h-6 w-2/3 bg-[var(--border)] rounded" />
          ) : Object.keys(assigneeMap).length === 0 ? (
            <div className="text-[var(--subtext)]">No personnel found</div>
          ) : (
            <ul className="space-y-6">
              {Object.entries(assigneeMap).map(([assignee, { user, issues }]) => {
                // Sum time spent for this assignee
                const totalSeconds = issues.reduce((sum, issue) => sum + (issue.fields.timetracking?.timeSpentSeconds || 0), 0);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                return (
                  <li key={assignee} className="">
                    <div className="flex items-center gap-2 mb-1">
                      {user?.avatarUrls?.['24x24'] && (
                        <img src={user.avatarUrls['24x24']} alt={assignee} className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-semibold text-[var(--foreground)]">{assignee}</span>
                      <span className="ml-2 text-xs text-[var(--subtext)]">{user?.emailAddress}</span>
                    </div>
                    <div className="text-xs text-[var(--subtext)] mb-1">Total Time Spent: {hours}h {minutes}m</div>
                    <ul className="ml-4 list-disc text-sm">
                      {issues.map((issue) => (
                        <li key={issue.id} className="mb-1">
                          <span className="font-mono text-[var(--accent)]">{issue.key}</span>: {issue.fields.summary}
                          {issue.fields.timetracking?.timeSpent && (
                            <span className="ml-2 text-xs text-[var(--subtext)]">({issue.fields.timetracking.timeSpent})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <footer className="w-full text-center py-6 text-xs text-[var(--subtext)]">Jira Dashboard &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
