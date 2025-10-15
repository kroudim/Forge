import { invoke } from '@forge/bridge';

export const getIssueContent = (issueKey) => invoke('loadIssueContent', { issueKey });
