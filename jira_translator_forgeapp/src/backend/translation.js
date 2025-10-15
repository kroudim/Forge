const prependTranslationMarker = (text) => {
  const original = text ?? '';
  return `TRNSLD - ${original}`;
};

export const translateIssue = async ({ segments }) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [];
  }

  return segments.map((segment) => ({
    ...segment,
    text: prependTranslationMarker(segment.text),
  }));
};
