import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ForgeReconciler, {
  Button,
  Form,
  FormFooter,
  Heading,
  SectionMessage,
  Select,
  Spinner,
  Stack,
  Text,
  Textfield,
} from '@forge/react';
import { useProductContext } from '@forge/react';

import { getIssueContent } from './services/issue';
import { translateSegments } from './services/translation';
import { buildTranslatedIssue, languageOptions } from './utils/translator';
import IssueContentView from './components/IssueContentView';

const TranslatorGlobalPage = () => {
  const productContext = useProductContext();
  const isProjectPage = productContext?.moduleKey === 'issue-translator-project';

  const [issueKeyInput, setIssueKeyInput] = useState('');
  const [loadedIssueKey, setLoadedIssueKey] = useState('');
  const [issueContent, setIssueContent] = useState(null);
  const [displayContent, setDisplayContent] = useState(null);
  const [language, setLanguage] = useState('original');
  const [loadingIssue, setLoadingIssue] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

  const resetStateForIssue = useCallback(() => {
    setIssueContent(null);
    setDisplayContent(null);
    setLanguage('original');
    setError(null);
  }, []);

  const handleIssueLoad = useCallback(async () => {
    const trimmedKey = issueKeyInput.trim();

    if (!trimmedKey) {
      setError(new Error('Issue key is required.'));
      return;
    }

    resetStateForIssue();
    setLoadingIssue(true);

    try {
      const content = await getIssueContent(trimmedKey);
      setLoadedIssueKey(trimmedKey);
      setIssueContent(content);
      setDisplayContent(content);
    } catch (err) {
      setLoadedIssueKey(trimmedKey);
      setIssueContent(null);
      setDisplayContent(null);
      setError(err);
    } finally {
      setLoadingIssue(false);
    }
  }, [issueKeyInput, resetStateForIssue]);

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

  const selectedLanguageOption = useMemo(
    () => languageOptions.find((option) => option.value === language) || languageOptions[0],
    [language]
  );

  const descriptionText = isProjectPage
    ? 'Translate any issue from this project by entering its key. Once loaded, choose a destination language and we’ll translate the full page: metadata, summary, description, and comments.'
    : 'Translate any Jira Service Management issue by entering its key. Once loaded, choose a destination language and we’ll translate the full page: metadata, summary, description, and comments.';

  return (
    <Stack space="space.250">
      <Stack space="space.100">
        <Heading as="h2" size="large">Issue Translator</Heading>
        <Text>{descriptionText}</Text>
      </Stack>

      <Form onSubmit={handleIssueLoad}>
        <Stack space="space.150">
          <Textfield
            name="issueKey"
            value={issueKeyInput}
            onChange={(event) => setIssueKeyInput(event.target.value)}
            placeholder="Example: JSM-123"
            isRequired
          />
          <FormFooter>
            <Button type="submit" appearance="primary">Load issue</Button>
          </FormFooter>
        </Stack>
      </Form>

      {loadingIssue && <Spinner label="Loading issue content" size="large" />}

      {error && (
        <SectionMessage title="Translation error" appearance="error">
          <Text>{error.message}</Text>
        </SectionMessage>
      )}

      {!loadingIssue && issueContent && !error && (
        <Stack space="space.200">
          <Text>Currently loaded issue: {loadedIssueKey}</Text>
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
          {translating ? (
            <Spinner label="Translating" />
          ) : (
            <IssueContentView content={displayContent} />
          )}
        </Stack>
      )}
    </Stack>
  );
};

export const run = () => ForgeReconciler.render(<TranslatorGlobalPage />);
