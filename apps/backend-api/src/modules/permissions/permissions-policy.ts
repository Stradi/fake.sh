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
    return (
      this.can(`Permission.${permission.id}.Show`, accountData) ||
      this.can('Permission.*.Show', accountData)
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Permission.Create', accountData);
  }

  public update(
    permission: typeof permissionsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Permission.${permission.id}.Update`, accountData) ||
      this.can('Permission.*.Update', accountData)
    );
  }

  public destroy(
    permission: typeof permissionsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Permission.${permission.id}.Destroy`, accountData) ||
      this.can('Permission.*.Destroy', accountData)
    );
  }
}
