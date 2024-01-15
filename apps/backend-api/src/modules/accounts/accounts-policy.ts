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
    return this.canMultiple(
      [`Account.${account.id}.Show`, 'Account.&.Show', 'Account.*.Show'],
      accountData,
      account,
      'id'
    );
  }

  public update(
    account: typeof accountsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [`Account.${account.id}.Update`, 'Account.&.Update', 'Account.*.Update'],
      accountData,
      account,
      'id'
    );
  }

  public destroy(
    account: typeof accountsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return this.canMultiple(
      [
        `Account.${account.id}.Destroy`,
        'Account.&.Destroy',
        'Account.*.Destroy',
      ],
      accountData,
      account,
      'id'
    );
  }
}
