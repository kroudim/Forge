import Resolver from '@forge/resolver';

import { getIssueContent } from './issue';
import { translateIssue } from './translation';

const resolver = new Resolver();

resolver.define('loadIssueContent', async ({ payload }) => {
  const { issueKey } = payload || {};

  if (!issueKey) {
    throw new Error('Missing issueKey in payload');
  }

  return getIssueContent(issueKey);
});

resolver.define('translateIssueSegments', async ({ payload }) => {
  const { segments, fromLanguage, toLanguage } = payload || {};

  if (!toLanguage) {
    throw new Error('Missing target language');
  }

  if (!Array.isArray(segments)) {
    throw new Error('Segments must be an array');
  }

  return translateIssue({ segments, fromLanguage, toLanguage });
});

export const handler = resolver.getDefinitions();
