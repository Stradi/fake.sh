import { callFakerMethod, isFakerSyntax } from './faker';

type JsonValue = string | number | boolean | null;
type Column = Record<
  string,
  JsonValue | JsonValue[] | Record<string, JsonValue>
>;

export function getCreateTableSql(tableName: string, columns: Column) {
  function getDbType(value: Column[number]): string {
    if (typeof value === 'number') {
      return 'integer';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    return 'text';
  }

  const sampleRow = generateData(columns);

  const columnDefinitions = Object.keys(columns)
    .map((columnName) => {
      return `${columnName} ${getDbType(sampleRow[columnName])}`;
    })
    .join(', ');

  return `CREATE TABLE ${tableName} (${columnDefinitions});`;
}

export function getInsertSql(column: Column) {
  const names = Object.keys(column).join(', ');
  const values = Object.values(column)
    .map((value) => {
      if (typeof value === 'object') {
        if (value === null) {
          return 'NULL';
        }

        return `'${JSON.stringify(value)}'`;
      }

      if (typeof value === 'string') {
        if (value.includes("'")) {
          return `'${value.replace(/'/g, "''")}'`;
        }
        return `'${value}'`;
      }

      return value;
    })
    .join(', ');

  return {
    names,
    values,
  };
}

export function generateData(column: Column) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- i don't know how to type this
  function getValueForColumn(syntax: Column[number]): any {
    if (typeof syntax === 'object') {
      if (Array.isArray(syntax)) {
        return syntax.map(getValueForColumn);
      }

      if (syntax === null) {
        return null;
      }

      return Object.entries(syntax).reduce<Record<string, unknown>>(
        (acc, [key, value]) => {
          acc[key] = getValueForColumn(value);
          return acc;
        },
        {}
      );
    }

    if (typeof syntax === 'string') {
      if (isFakerSyntax(syntax)) {
        return callFakerMethod(syntax);
      }

      return syntax;
    }

    return syntax;
  }

  return Object.entries(column).reduce<
    Record<string, string | number | boolean | null>
  >((acc, [key, value]) => {
    acc[key] = getValueForColumn(value);
    return acc;
  }, {});
}
