import React, { useEffect, useMemo, useState } from 'react';
import ForgeReconciler, {
    Heading,
    Text,
    Select,
    SectionMessage,
    Spinner,
    Stack,
} from '@forge/react';
import { useProductContext } from '@forge/react';

import { getIssueContent } from './services/issue';
import { translateSegments } from './services/translation';
import { buildTranslatedIssue, languageOptions } from './utils/translator';
import IssueContentView from './components/IssueContentView';

const TranslatorPanel = () => {
    const productContext = useProductContext();
    const issueKey = useMemo(() => (
        productContext?.platformContext?.issueKey
        || productContext?.platformContext?.issueId
        || productContext?.extension?.issueKey
        || productContext?.extension?.issue?.key
    ), [productContext]);

    const [language, setLanguage] = useState('original');
    const [issueContent, setIssueContent] = useState(null);
    const [displayContent, setDisplayContent] = useState(null);
    const [error, setError] = useState(null);
    const [loadingIssue, setLoadingIssue] = useState(true);
    const [translating, setTranslating] = useState(false);

    // Log when the component loads and what issue key is found
    useEffect(() => {
        console.log('[TranslatorPanel] Product context:', productContext);
        console.log('[TranslatorPanel] Computed issueKey:', issueKey);
    }, [productContext, issueKey]);

    useEffect(() => {
        const loadIssue = async () => {
            setError(null);

            if (!issueKey) {
                console.error('[TranslatorPanel] Unable to determine issue key for translation.');
                setError(new Error('Unable to determine the issue key for translation.'));
                setLoadingIssue(false);
                return;
            }

            setLoadingIssue(true);
            try {
                console.log(`[TranslatorPanel] Loading issue content for issueKey: ${issueKey}`);
                const content = await getIssueContent(issueKey);
                console.log('[TranslatorPanel] Issue content loaded:', content);
                setIssueContent(content);
                setDisplayContent(content);
            } catch (err) {
                console.error('[TranslatorPanel] Error loading issue content:', err);
                setError(err);
            } finally {
                setLoadingIssue(false);
            }
        };

        loadIssue();
    }, [issueKey]);

    useEffect(() => {
        const runTranslation = async () => {
            if (!issueContent) {
                console.log('[TranslatorPanel] No issue content to translate.');
                return;
            }

            if (language === 'original') {
                console.log('[TranslatorPanel] Language is original, not translating.');
                setDisplayContent(issueContent);
                return;
            }

            setTranslating(true);
            setError(null);

            try {
                console.log(`[TranslatorPanel] Translating issue segments to ${language}`);
                const translatedSegments = await translateSegments(issueContent.segments, language);
                console.log('[TranslatorPanel] Translated segments:', translatedSegments);
                setDisplayContent(buildTranslatedIssue(issueContent, translatedSegments));
            } catch (err) {
                console.error('[TranslatorPanel] Error translating segments:', err);
                setError(err);
            } finally {
                setTranslating(false);
            }
        };

        runTranslation();
    }, [language, issueContent]);

    if (error) {
        console.error('[TranslatorPanel] Rendering error section:', error);
        return (
            <SectionMessage title="Translation error" appearance="error">
                <Text>{error.message}</Text>
            </SectionMessage>
        );
    }

    if (loadingIssue || !displayContent) {
        console.log('[TranslatorPanel] Showing loading spinner...');
        return <Spinner label="Loading issue content" size="large" />;
    }

    const selectedLanguageOption = languageOptions.find((option) => option.value === language) || languageOptions[0];

    return (
        <Stack space="space.200">
            <Heading as="h2" size="large">Issue Translator</Heading>
            <Text>Choose a language to translate the issue summary, description, and comments.</Text>
            <Select
                value={selectedLanguageOption}
                options={languageOptions}
                onChange={(option) => {
                    const newValue = Array.isArray(option) ? option[0]?.value : option?.value;
                    console.log(`[TranslatorPanel] Language changed to: ${newValue}`);
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
    );
};

export const run = () => ForgeReconciler.render(<TranslatorPanel />);
