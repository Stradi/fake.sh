import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { permissionsTable } from './permissions-schema';

export default class PermissionsPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Permission.Index', accountData);
  }

  public show(
    permission: typeof permissionsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Permission.${permission.id}.Show`, 'Permission.*.Show'],
      accountData
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Permission.Create', accountData);
  }

  public update(
    permission: typeof permissionsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Permission.${permission.id}.Update`, 'Permission.*.Update'],
      accountData
    );
  }

  public destroy(
    permission: typeof permissionsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Permission.${permission.id}.Destroy`, 'Permission.*.Destroy'],
      accountData
    );
  }
}
