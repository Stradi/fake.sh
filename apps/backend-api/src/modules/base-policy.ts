import { BaseError } from '@fake.sh/backend-common';
import type { DefaultGroups } from '@lib/database/seed/groups';
import type { JwtClaims } from '@utils/jwt';
import type { accountsTable } from './accounts/accounts-schema';
import type { groupsTable } from './groups/groups-schema';
import type { permissionsTable } from './permissions/permissions-schema';
import PermissionsService from './permissions/permissions-service';
import type { projectsTable } from './projects/projects-schema';
import type { schemasTable } from './schemas/schemas-schema';

type AvailableResources =
  | typeof projectsTable.$inferSelect
  | typeof schemasTable.$inferSelect
  | typeof accountsTable.$inferSelect
  | typeof groupsTable.$inferSelect
  | typeof permissionsTable.$inferSelect;

type PermissionWithGroup = typeof permissionsTable.$inferSelect & {
  groupPermissions: {
    group_id: string;
    permission_id: string;
    group: {
      id: string;
      name: string;
      created_at: Date;
      updated_at: Date;
    };
  }[];
};

const DefaultAccountGroups: (typeof DefaultGroups)[number][] = [
  'Registered User',
];

export default class BasePolicy {
  private permissionsService = new PermissionsService();

  public async can<T extends AvailableResources>(
    permissionName: string,
    accountData?: JwtClaims,
    resourceObj?: T,
    resourceField?: keyof T
  ) {
    const { scope } = this.parsePermissionName(permissionName);

    // If scope is ID and if id of the resource is not the same as the scope,
    // there is no need to check the permission. Just return false.
    if (scope && scope !== '&' && scope !== '*') {
      if (!resourceObj) return false;
      if (isNaN(Number(scope))) return false;
      if (resourceObj.id !== scope) return false;
    }

    const permission = await this.getPermission(permissionName);
    if (!permission) return false;

    const groups = accountData ? accountData.groups : DefaultAccountGroups;

    // If scope is `&` and the creator of the resource is the same as the account
    // then allow the action.
    if (scope && scope === '&' && resourceObj && resourceField) {
      if (!accountData) return false;
      if (resourceObj[resourceField] !== accountData.id) return false;

      for (const name of groups) {
        const allowed = this.isGroupAllowedTo(name, permission);
        if (allowed) return true;
      }

      return false;
    }

    for (const name of groups) {
      if (this.isGroupAllowedTo(name, permission)) return true;
    }

    return false;
  }

  private getPermission(
    permissionName: string
  ): Promise<PermissionWithGroup | null> {
    return this.permissionsService.show(permissionName);
  }

  private parsePermissionName(permissionName: string) {
    const arr = permissionName.split('.');
    if (arr.length !== 2 && arr.length !== 3) {
      throw new BaseError({
        code: 'INVALID_PERMISSION_NAME',
        message: 'Could not parse permission name',
        action:
          "Permission name must be in the format of 'Resource.Action' or 'Resource.Scope.Action'",
        statusCode: 500,
        additionalData: {
          permissionName,
        },
      });
    }

    if (arr.length === 2) {
      return {
        resource: arr[0],
        action: arr[1],
      };
    }

    return {
      resource: arr[0],
      scope: arr[1],
      action: arr[2],
    };
  }

  private isGroupAllowedTo(groupName: string, permission: PermissionWithGroup) {
    const groupPermission = permission.groupPermissions.find(
      (gp) => gp.group.name === groupName
    );
    return groupPermission !== undefined;
  }
}
