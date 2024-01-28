'use client';

import type { PropsWithChildren } from 'react';
import { createContext } from 'react';
import { createSchema, deleteSchema } from './schemas-actions';
import type { CreateSchemaApiFn, DeleteSchemaApiFn } from './schemas-types';

type TSchemasApiContext = {
  createSchema: CreateSchemaApiFn;
  deleteSchema: DeleteSchemaApiFn;
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
        deleteSchema,
      }}
    >
      {children}
    </SchemasApiContext.Provider>
  );
}

export { SchemasApiContext, SchemasApiProvider };
