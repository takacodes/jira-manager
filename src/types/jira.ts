export interface JiraUser {
  displayName: string;
  emailAddress?: string;
  avatarUrls?: { [size: string]: string };
}
export interface JiraStatus {
  name: string;
}
export interface JiraTimeTracking {
  timeSpent?: string;
  timeSpentSeconds?: number;
  [key: string]: unknown;
}
export interface JiraIssueFields {
  summary: string;
  status: JiraStatus;
  assignee?: JiraUser;
  updated: string;
  timetracking?: JiraTimeTracking;
}
export interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
}
export interface JiraBravoIssues {
  issues: JiraIssue[];
}
