import React from 'react';
import { Heading, Stack, Text, Strong } from '@forge/react';

const NO_VALUE = 'No value provided.';
const NO_COMMENTS = 'No comments found.';

const IssueContentView = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <Stack space="space.200">
      {content.details?.length ? (
        <Stack space="space.150">
          <Heading as="h3" size="medium">Details</Heading>
          <Stack space="space.100">
            {content.details.map((detail) => (
              <Stack key={detail.key} space="space.050">
                <Text>
                  <Strong>{detail.label}</Strong>
                </Text>
                <Text>{detail.value || NO_VALUE}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ) : null}

      <Stack space="space.050">
        <Heading as="h3" size="medium">Summary</Heading>
        <Text>{content.summary || NO_VALUE}</Text>
      </Stack>

      <Stack space="space.050">
        <Heading as="h3" size="medium">Description</Heading>
        <Text>{content.description || NO_VALUE}</Text>
      </Stack>

      <Stack space="space.150">
        <Heading as="h3" size="medium">Comments</Heading>
        {content.comments?.length ? (
          <Stack space="space.100">
            {content.comments.map((comment) => (
              <Stack key={comment.id} space="space.050">
                <Text>
                  <Strong>{comment.author}</Strong>
                </Text>
                <Text>{comment.body || NO_VALUE}</Text>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Text>{NO_COMMENTS}</Text>
        )}
      </Stack>
    </Stack>
  );
};

export default IssueContentView;
