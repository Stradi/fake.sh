import knex from 'knex';
import { callFakerMethod, isFakerSyntax } from './faker';

type JsonValue = string | number | boolean | null;
type DbColumn = Record<
  string,
  JsonValue | JsonValue[] | Record<string, JsonValue>
>;

type Options = {
  tableName: string;
  columns: DbColumn;
};

export default class TenantResource {
  private tableName: string;
  private columns: DbColumn;
  private db = knex({ client: 'pg' });

  constructor(options: Options) {
    this.tableName = options.tableName;
    this.columns = options.columns;
  }

  get sql() {
    return {
      createTable: this.sqlCreateTable.bind(this),
      insert: this.sqlInsert.bind(this),
      dropTable: this.sqlDropTable.bind(this),
    };
  }

  public generateRowData() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- i don't know how to type this
    function getValueForColumn(syntax: DbColumn[number]): any {
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

    return Object.entries(this.columns).reduce<
      Record<string, string | number | boolean | null>
    >((acc, [key, value]) => {
      acc[key] = getValueForColumn(value);
      return acc;
    }, {});
  }

  private sqlCreateTable() {
    function getDbType(value: DbColumn[number]): string {
      if (typeof value === 'number') {
        return 'integer';
      }

      if (typeof value === 'boolean') {
        return 'boolean';
      }

      return 'text';
    }

    const sampleRow = this.generateRowData();

    return this.db.schema
      .createTable(this.tableName, (table) => {
        table.increments('__id').primary();

        const entries = Object.keys(this.columns).filter(
          (key) => key !== '__id'
        );

        for (const columnName of entries) {
          const dbType = getDbType(sampleRow[columnName]);
          // @ts-expect-error -- wut?
          table[dbType](columnName);
        }
      })
      .toQuery();
  }

  private sqlInsert(
    rowData: Record<string, unknown> | Record<string, unknown>[]
  ) {
    function mapRowData(row: Record<string, unknown>) {
      return Object.entries(row).reduce<Record<string, unknown>>(
        (acc, [key, value]) => {
          if (typeof value === 'object') {
            if (value === null) {
              acc[key] = null;
            } else {
              acc[key] = JSON.stringify(value);
            }
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
    }

    if (Array.isArray(rowData)) {
      return this.db
        .insert(rowData.map(mapRowData))
        .into(this.tableName)
        .toQuery();
    }

    return this.db.insert(mapRowData(rowData)).into(this.tableName).toQuery();
  }

  private sqlDropTable() {
    return this.db.schema.dropTable(this.tableName).toQuery();
  }
}
