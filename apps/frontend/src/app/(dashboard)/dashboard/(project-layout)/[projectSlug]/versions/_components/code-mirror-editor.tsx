'use client';

import { json, jsonLanguage, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import ReactCodeMirror, { hoverTooltip } from '@uiw/react-codemirror';
import {
  handleRefresh,
  jsonCompletion,
  jsonSchemaHover,
  jsonSchemaLinter,
  stateExtensions,
} from 'codemirror-json-schema';
import { useCallback, useState } from 'react';
import './code-mirror-editor.css';

type Props = {
  height: string;
  defaultValue?: string;
  defaultCursorPosition?: number;
  onValueChange?: (value: string) => void;
};

const schema = {
  type: 'object',
  required: ['version', 'data'],
  properties: {
    version: {
      type: 'integer',
      description: 'The version of the API',
    },
    data: {
      type: 'object',
      description: 'Resources (models) that the API exposes',
      additionalProperties: {
        required: ['initialCount', 'columns'],
        type: 'object',
        description: 'A resource (API route)',
        properties: {
          initialCount: {
            type: 'integer',
            description: 'The number of records to generate initially',
          },
          columns: {
            type: 'object',
            description: 'The columns of the resource',
          },
        },
      },
    },
  },
} as const;

export default function CodeMirrorEditor({
  height,
  defaultValue = '',
  defaultCursorPosition = 0,
  onValueChange,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback(
    (newValue) => {
      setValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  return (
    <ReactCodeMirror
      extensions={[
        json(),
        linter(jsonParseLinter(), {
          delay: 100,
        }),
        linter(jsonSchemaLinter(), {
          needsRefresh: handleRefresh,
        }),
        jsonLanguage.data.of({
          autocomplete: jsonCompletion(),
        }),
        hoverTooltip(jsonSchemaHover()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- not accepting "required" property
        stateExtensions(schema as any),
      ]}
      height={height}
      onChange={onChange}
      onCreateEditor={(view) => {
        view.focus();
        view.dispatch({
          selection: {
            anchor: defaultCursorPosition,
            head: defaultCursorPosition,
          },
        });
      }}
      value={value}
    />
  );
}
