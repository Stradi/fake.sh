'use client';

import { useContext } from 'react';
import { SchemasApiContext } from './schemas-api-provider';

export default function useSchemasApi() {
  const api = useContext(SchemasApiContext);
  return api;
}
