type BaseApiObject = {
  id: string;
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
  account_id: string;
  group_id: string;
  account: ApiAccount;
  group: ApiGroup;
};

export type ApiPermission = BaseApiObject & {
  name: string;
  groupPermission: ApiGroupPermission[];
};

export type ApiGroupPermission = {
  group_id: string;
  permission_id: string;
  group: ApiGroup;
  permission: ApiPermission;
};

export type ApiProject = BaseApiObject & {
  name: string;
  slug: string;
  createdBy: string;
  owner: ApiAccount;
  schemas: ApiSchema[];
  usage?: number;
};

export type ApiSchema = BaseApiObject & {
  version: number;
  data: unknown;
  project_id: string;
  created_by: string;
  project: ApiProject;
  owner: ApiAccount;
};

export type ApiSchemaLogs = {
  id: number;
  url: string;
  method: string;
  status_code: number;
  body: unknown;
  headers: Record<string, string>;
  created_at: number;
};
