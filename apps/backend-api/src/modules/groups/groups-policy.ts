import BasePolicy from '@modules/base-policy';
import type { JwtClaims } from '@utils/jwt';
import type { groupsTable } from './groups-schema';

export default class GroupsPolicy extends BasePolicy {
  public index(accountData?: JwtClaims) {
    return this.can('Group.Index', accountData);
  }

  public show(group: typeof groupsTable.$inferSelect, accountData?: JwtClaims) {
    return (
      this.can(`Group.${group.id}.Show`, accountData) ||
      this.can('Group.*.Show', accountData)
    );
  }

  public create(accountData?: JwtClaims) {
    return this.can('Group.Create', accountData);
  }

  public update(
    group: typeof groupsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Group.${group.id}.Update`, accountData) ||
      this.can('Group.*.Update', accountData)
    );
  }

  public destroy(
    group: typeof groupsTable.$inferSelect,
    accountData?: JwtClaims
  ) {
    return (
      this.can(`Group.${group.id}.Destroy`, accountData) ||
      this.can('Group.*.Destroy', accountData)
    );
  }
}
