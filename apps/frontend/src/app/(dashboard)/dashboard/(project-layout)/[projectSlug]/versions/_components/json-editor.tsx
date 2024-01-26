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
import './json-editor.css';

type Props = {
  height: string;

  value?: string;
  onValueChange?: (value: string) => void;
  cursorPosition?: number;
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

export default function JsonEditor({
  height,
  value = '',
  onValueChange,
  cursorPosition = 0,
}: Props) {
  function onChange(newValue: string) {
    onValueChange?.(newValue);
  }

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
            anchor: cursorPosition,
            head: cursorPosition,
          },
        });
      }}
      value={value}
    />
  );
}
