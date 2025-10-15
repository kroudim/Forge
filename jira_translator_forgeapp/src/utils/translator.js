export const languageOptions = [
  { label: 'Original', value: 'original' },
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese (Brazil)', value: 'pt-br' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese (Simplified)', value: 'zh-Hans' },
];

export const buildTranslatedIssue = (baseContent, translatedSegments) => {
  if (!baseContent) {
    return null;
  }

  const findSegmentText = (key) => translatedSegments.find((segment) => segment.key === key)?.text;

  const details = (baseContent.details || []).map((detail) => {
    const translated = findSegmentText(detail.segmentKey);
    return {
      ...detail,
      value: translated || detail.value,
    };
  });

  const comments = baseContent.comments.map((comment, index) => {
    const translated = findSegmentText(`comment-${index}`);
    return {
      ...comment,
      body: translated || comment.body,
    };
  });

  return {
    ...baseContent,
    summary: findSegmentText('summary') || baseContent.summary,
    description: findSegmentText('description') || baseContent.description,
    details,
    comments,
  };
};
