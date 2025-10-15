import { invoke } from '@forge/bridge';

export const translateSegments = (segments, targetLanguage) => {
  if (!segments?.length) {
    return Promise.resolve([]);
  }

  return invoke('translateIssueSegments', {
    segments,
    toLanguage: targetLanguage,
  });
};
