import React from 'react';
import ForgeReconciler from '@forge/react';

import { RequestTranslatorPanel } from './portal';

const PortalHeaderTranslator = () => (
  <RequestTranslatorPanel
    title="Issue Translator"
    description="Translate the request you're viewing directly from the customer portal header."
    missingIssueMessage="Open a specific request to enable translation in the portal header."
  />
);

export const run = () => ForgeReconciler.render(<PortalHeaderTranslator />);
