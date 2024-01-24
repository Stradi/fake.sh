'use client';

import type { PropsWithChildren } from 'react';
import { createContext } from 'react';
import { createSchema } from './schemas-actions';
import type { CreateSchemaApiFn } from './schemas-types';

type TSchemasApiContext = {
  createSchema: CreateSchemaApiFn;
};

const SchemasApiContext = createContext<TSchemasApiContext>(
  {} as TSchemasApiContext
);

type Props = PropsWithChildren;

function SchemasApiProvider({ children }: Props) {
  return (
    <SchemasApiContext.Provider
      value={{
        createSchema,
      }}
    >
      {children}
    </SchemasApiContext.Provider>
  );
}

export { SchemasApiContext, SchemasApiProvider };
