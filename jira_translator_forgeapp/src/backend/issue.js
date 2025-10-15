import api from '@forge/api';

const extractTextFromAdf = (node) => {
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child) => extractTextFromAdf(child)).join(' ');
  }

  if (typeof node === 'object') {
    if (node.type === 'text') {
      return node.text || '';
    }

    if (Array.isArray(node.content)) {
      return extractTextFromAdf(node.content);
    }
  }

  return '';
};

const stripHtml = (html) => {
  if (!html) {
    return '';
  }

  if (typeof html === 'string') {
    return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  }

  return extractTextFromAdf(html);
};

const normaliseWhitespace = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const addDetail = (details, detailKeys, segments, key, label, value, { alreadyNormalised = false } = {}) => {
  if (detailKeys.has(key)) {
    return;
  }

  const stringValue = value ?? '';
  const text = alreadyNormalised
    ? normaliseWhitespace(stringValue)
    : normaliseWhitespace(stripHtml(stringValue));

  if (!text) {
    return;
  }

  const segmentKey = `detail-${key}`;
  details.push({ key, label, value: text, segmentKey });
  segments.push({ key: segmentKey, text });
  detailKeys.add(key);
};

export const getIssueContent = async (issueKey) => {
  const fieldQuery = [
    'summary',
    'description',
    'comment',
    'status',
    'priority',
    'issuetype',
    'reporter',
    'assignee',
    'creator',
    'environment',
    'components',
    'labels',
    'resolution',
    'resolutiondate',
    'created',
    'updated',
  ].join(',');

  const response = await api
    .asApp()
    .requestJira(`/rest/api/3/issue/${issueKey}?expand=renderedFields,names&fields=${fieldQuery}`);

  if (!response.ok) {
    const message = `Failed to retrieve issue ${issueKey}: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const fields = data.fields || {};
  const renderedFields = data.renderedFields || {};
  const names = data.names || {};

  const summary = normaliseWhitespace(fields.summary || '');
  const description = normaliseWhitespace(stripHtml(renderedFields.description || fields.description || ''));
  const comments = (fields.comment?.comments || []).map((comment, index) => ({
    id: comment.id || index.toString(),
    author: comment.author?.displayName || 'Unknown author',
    body: normaliseWhitespace(stripHtml(comment.renderedBody || comment.body || '')),
  }));

  const segments = [
    { key: 'summary', text: summary },
    { key: 'description', text: description },
  ];

  const details = [];
  const detailKeys = new Set();

  addDetail(details, detailKeys, segments, 'status', 'Status', fields.status?.name, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'status-description', 'Status description', renderedFields.status?.description || fields.status?.description || '');
  addDetail(details, detailKeys, segments, 'priority', 'Priority', fields.priority?.name, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'issue-type', 'Issue type', fields.issuetype?.name, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'issue-type-description', 'Issue type description', fields.issuetype?.description || '');
  addDetail(details, detailKeys, segments, 'reporter', 'Reporter', fields.reporter?.displayName, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'assignee', 'Assignee', fields.assignee?.displayName, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'creator', 'Creator', fields.creator?.displayName, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'environment', 'Environment', renderedFields.environment || fields.environment || '');

  const components = (fields.components || []).map((component) => component.name).filter(Boolean).join(', ');
  addDetail(details, detailKeys, segments, 'components', 'Components', components, { alreadyNormalised: true });
  const labels = (fields.labels || []).join(', ');
  addDetail(details, detailKeys, segments, 'labels', 'Labels', labels, { alreadyNormalised: true });

  const resolution = fields.resolution?.name;
  addDetail(details, detailKeys, segments, 'resolution', 'Resolution', resolution, { alreadyNormalised: true });

  addDetail(details, detailKeys, segments, 'created', 'Created', fields.created, { alreadyNormalised: true });
  addDetail(details, detailKeys, segments, 'updated', 'Updated', fields.updated, { alreadyNormalised: true });

  const excludedRenderedKeys = new Set([
    'description',
    'environment',
    'comment',
  ]);

  Object.entries(renderedFields).forEach(([fieldKey, value]) => {
    if (excludedRenderedKeys.has(fieldKey)) {
      return;
    }

    const label = names[fieldKey] || fieldKey;
    addDetail(details, detailKeys, segments, fieldKey, label, value);
  });

  const translatedComments = comments.map((comment, idx) => ({
    key: `comment-${idx}`,
    commentIndex: idx,
    author: comment.author,
    text: comment.body,
  }));

  segments.push(...translatedComments);

  return {
    summary,
    description,
    comments,
    details,
    segments,
  };
};
