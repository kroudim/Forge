import React, { useEffect, useMemo, useState } from 'react';
import ForgeReconciler, {
  Heading,
  SectionMessage,
  Select,
  Spinner,
  Stack,
  Text,
} from '@forge/react';
import { useProductContext } from '@forge/react';

import { getIssueContent } from './services/issue';
import { translateSegments } from './services/translation';
import { buildTranslatedIssue, languageOptions } from './utils/translator';
import IssueContentView from './components/IssueContentView';

export const RequestTranslatorPanel = ({
  title = 'Issue Translator',
  description = 'Translate this request’s full content into another language.',
  missingIssueMessage = 'Open a request to translate its content.',
} = {}) => {
  const productContext = useProductContext();
  const issueKey = useMemo(
    () => productContext?.platformContext?.issueKey || productContext?.platformContext?.issue?.key,
    [productContext]
  );

  const [language, setLanguage] = useState('original');
  const [issueContent, setIssueContent] = useState(null);
  const [displayContent, setDisplayContent] = useState(null);
  const [error, setError] = useState(null);
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const loadIssue = async () => {
      setError(null);

      if (!issueKey) {
        setError(new Error(missingIssueMessage));
        setLoadingIssue(false);
        return;
      }

      setLoadingIssue(true);

      try {
        const content = await getIssueContent(issueKey);
        setIssueContent(content);
        setDisplayContent(content);
      } catch (err) {
        setError(err);
      } finally {
        setLoadingIssue(false);
      }
    };

    loadIssue();
  }, [issueKey, missingIssueMessage]);

  useEffect(() => {
    const runTranslation = async () => {
      if (!issueContent) {
        return;
      }

      if (language === 'original') {
        setDisplayContent(issueContent);
        return;
      }

      setTranslating(true);
      setError(null);

      try {
        const translatedSegments = await translateSegments(issueContent.segments, language);
        setDisplayContent(buildTranslatedIssue(issueContent, translatedSegments));
      } catch (err) {
        setError(err);
      } finally {
        setTranslating(false);
      }
    };

    runTranslation();
  }, [language, issueContent]);

  if (error) {
    return (
      <SectionMessage title="Translation error" appearance="error">
        <Text>{error.message}</Text>
      </SectionMessage>
    );
  }

  if (loadingIssue || !displayContent) {
    return <Spinner label="Loading request content" size="large" />;
  }

  const selectedLanguageOption = languageOptions.find((option) => option.value === language) || languageOptions[0];

  return (
    <Stack space="space.200">
      <Stack space="space.100">
        <Heading as="h2" size="large">{title}</Heading>
        <Text>{description}</Text>
      </Stack>
      <Select
        value={selectedLanguageOption}
        options={languageOptions}
        onChange={(option) => {
          const newValue = Array.isArray(option) ? option[0]?.value : option?.value;
          setLanguage(newValue || 'original');
        }}
        isSearchable
        placeholder="Select a language"
      />
      {translating ? <Spinner label="Translating" /> : <IssueContentView content={displayContent} />}
    </Stack>
  );
};

export const run = () => ForgeReconciler.render(<RequestTranslatorPanel />);
