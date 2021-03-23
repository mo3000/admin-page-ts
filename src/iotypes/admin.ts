
interface RoleItem {
  id: number;
  name: string;
  display_name?: string;
}

interface AdminListItem {
  id: number;
  username: string;
  realname: string;
  roles: Array<RoleItem>;
  status: number;
  created_at: string;
}

type AdminList = Array<AdminListItem>;

export type {
  AdminList, RoleItem, AdminListItem,
};