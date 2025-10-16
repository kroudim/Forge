import { invoke } from '@forge/bridge';

export const translateSegments = async (segments, targetLanguage) => {
    console.log('[services/translation] Invoking translateIssueSegments with:', { segments, targetLanguage });
    if (!segments?.length) {
        return [];
    }

    try {
        const result = await invoke('translateIssueSegments', {
            segments,
            toLanguage: targetLanguage,
        });
        console.log('[services/translation] Received result:', result);
        return result;
    } catch (err) {
        console.error('[services/translation] Error from backend:', err);
        throw err;
    }
};
