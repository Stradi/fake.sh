type BaseApiObject = {
  id: number;
  created_at: number;
  updated_at: number;
};

export type ApiAccount = BaseApiObject & {
  email: string;
  accountGroup: ApiAccountGroup[];
};

export type ApiGroup = BaseApiObject & {
  name: string;
  accountGroup: ApiAccountGroup[];
  groupPermission: ApiGroupPermission[];
};

export type ApiAccountGroup = {
  account_id: number;
  group_id: number;
  account: ApiAccount;
  group: ApiGroup;
};

export type ApiPermission = BaseApiObject & {
  name: string;
  groupPermission: ApiGroupPermission[];
};

export type ApiGroupPermission = {
  group_id: number;
  permission_id: number;
  group: ApiGroup;
  permission: ApiPermission;
};
