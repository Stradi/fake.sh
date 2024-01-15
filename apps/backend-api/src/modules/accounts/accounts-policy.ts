import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { accountsTable } from './accounts-schema';

export default class AccountsPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Account.Index', accountData);
  }

  public show(
    account: typeof accountsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Account.${account.id}.Show`, accountData) ||
      this.can('Account.*.Show', accountData)
    );
  }

  public update(
    account: typeof accountsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Account.${account.id}.Update`, accountData) ||
      this.can('Account.&.Update', accountData) ||
      this.can('Account.*.Update', accountData)
    );
  }

  public destroy(
    account: typeof accountsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Account.${account.id}.Destroy`, accountData) ||
      this.can('Account.&.Destroy', accountData) ||
      this.can('Account.*.Destroy', accountData)
    );
  }
}
