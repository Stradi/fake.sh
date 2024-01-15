import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { schemasTable } from './schemas-schema';

export default class SchemasPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Schema.Index', accountData);
  }

  public show(
    schema: typeof schemasTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Schema.${schema.id}.Show`, 'Schema.&.Read', 'Schema.*.Show'],
      accountData,
      schema,
      'created_by'
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Schema.Create', accountData);
  }

  public update(
    schema: typeof schemasTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Schema.${schema.id}.Update`, 'Schema.&.Update', 'Schema.*.Update'],
      accountData,
      schema,
      'created_by'
    );
  }

  public destroy(
    schema: typeof schemasTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Schema.${schema.id}.Destroy`, 'Schema.&.Destroy', 'Schema.*.Destroy'],
      accountData,
      schema,
      'created_by'
    );
  }
}
