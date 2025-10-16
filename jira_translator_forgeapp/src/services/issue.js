import { invoke } from '@forge/bridge';

export const getIssueContent = async (issueKey) => {
    console.log('[services/issue] Invoking loadIssueContent with:', issueKey);
    try {
        const result = await invoke('loadIssueContent', { issueKey });
        console.log('[services/issue] Received result:', result);
        return result;
    } catch (err) {
        console.error('[services/issue] Error from backend:', err);
        throw err;
    }
};
