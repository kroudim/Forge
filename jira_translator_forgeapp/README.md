# Jira Issue Translator Forge App

Translate Jira Cloud issue content on demand using Microsoft Translator. The app adds an Issue Panel with a language selector that translates the summary, description, and comments without leaving the issue view. The design also anticipates plugging in DeepL as an optional provider later.

## Features

- Jira Cloud Forge app using UI Kit UI components
- Issue panel with language dropdown (`Original` plus a curated set of target languages)
- Global navigation entry in the Jira header that translates entire issue pages (metadata, summary, description, comments) from any screen
- Project navigation page so agents can open the translator workspace without leaving their queue
- Customer request view panel that lets portal users translate their request details in place
- On-demand translation of issue summary, description, and comments via Microsoft Translator
- Graceful error handling for missing credentials or API failures
- Extensible service layer designed to support additional translation providers (e.g., DeepL)


## Prerequisites

- [Atlassian Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/) (login required)
- Node.js 18+ (Forge currently ships Node.js 20 runtime)
- Microsoft Translator resource with subscription key and region
- Jira Cloud site where you have permissions to install Forge apps

## Setup

1. Install dependencies:

```powershell
npm install
```

2. Configure Forge environment variables for the translator credentials:

```powershell
forge variables set --environment development MS_TRANSLATOR_KEY "<your-key>"
forge variables set --environment development MS_TRANSLATOR_REGION "<azure-region>"
# Optional override when using a private Cognitive Services endpoint
forge variables set --environment development MS_TRANSLATOR_ENDPOINT "https://api.cognitive.microsofttranslator.com"
```

3. Deploy and install the app to your development environment:

```powershell
forge deploy --environment development
forge install --environment development
```

4. Grant the app access to the desired Jira Cloud site during installation. After installation:
	- Open any issue and expand the **Issue Translator** panel in the right-hand sidebar.
	- Use the Jira header’s **Issue Translator** navigation item (next to search/account) or the **Project Pages → Issue Translator** entry to launch the full workspace.
	- On the customer portal request view, expand the **Issue Translator** panel to translate request details on demand.

## Development Workflow

- Lint / sanity check: `npm test` (runs `forge lint`)
- Deploy to a Forge environment after code changes: `npm run forge:deploy`
- Update environment variables whenever you rotate API keys: `forge variables set ...`

## Extensibility Notes

- The translation service is isolated in `src/services/translation.js`. To add DeepL, create a parallel module (e.g., `deepl.js`) and update the main panel to switch providers based on configuration.
- The issue fetching logic in `src/services/issue.js` collects summary, description, and comments. Extend this module if you need to support additional fields.
- The issue fetching logic in `src/services/issue.js` collects summary, description, comments, and rendered metadata fields. Extend this module if you need to support bespoke field types or caching.

## Troubleshooting

- **Missing environment variable errors**: Ensure the translator key and region are set for the active Forge environment.
- **401/403 from Microsoft Translator**: Confirm the subscription key and region are correct and the resource is active.
- **Empty translations**: Verify the target language code is supported by Microsoft Translator.

## Next Steps

- Implement provider selection (Microsoft vs. DeepL) via app configuration or admin settings.
- Cache recent translations using Forge storage to reduce API usage.
- Extend translation coverage to custom fields or attachments if needed.
