import Resolver from '@forge/resolver';

import { getIssueContent } from './issue';
import { translateIssue } from './translation';

const resolver = new Resolver();

resolver.define('loadIssueContent', async ({ payload }) => {
    console.log('[resolver] Received loadIssueContent with payload:', payload);
    const { issueKey } = payload || {};

    if (!issueKey) {
        console.error('[resolver] Missing issueKey in payload');
        throw new Error('Missing issueKey in payload');
    }

    try {
        const result = await getIssueContent(issueKey);
        console.log('[resolver] getIssueContent result:', result);
        return result;
    } catch (err) {
        console.error('[resolver] Error in getIssueContent:', err);
        throw err;
    }
});

resolver.define('translateIssueSegments', async ({ payload }) => {
    console.log('[resolver] Received translateIssueSegments with payload:', payload);
    const { segments, fromLanguage, toLanguage } = payload || {};

    if (!toLanguage) {
        console.error('[resolver] Missing target language');
        throw new Error('Missing target language');
    }

    if (!Array.isArray(segments)) {
        console.error('[resolver] Segments must be an array');
        throw new Error('Segments must be an array');
    }

    try {
        const result = await translateIssue({ segments, fromLanguage, toLanguage });
        console.log('[resolver] translateIssue result:', result);
        return result;
    } catch (err) {
        console.error('[resolver] Error in translateIssue:', err);
        throw err;
    }
});

export const handler = resolver.getDefinitions();
