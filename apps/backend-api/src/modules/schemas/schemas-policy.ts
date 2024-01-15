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
      [`Schema.${schema.id}.Show`, 'Schema.*.Show'],
      accountData
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
      [`Schema.${schema.id}.Update`, 'Schema.*.Update'],
      accountData
    );
  }

  public destroy(
    schema: typeof schemasTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Schema.${schema.id}.Destroy`, 'Schema.*.Destroy'],
      accountData
    );
  }
}
