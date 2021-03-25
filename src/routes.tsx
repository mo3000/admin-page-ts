import React, {ReactComponentElement} from "react";
import Admin from "./pages/admin";
import {UserOutlined} from '@ant-design/icons';

interface MenuType {
  path: string;
  children: MenuType[] | null;
  icon: string | ReactComponentElement<any>;
  display_name: string;
  roles: string[];
}

interface RouterComponentItem {
  path: string;
  component: React.FC<any>;
}

const MenuItemDef: MenuType[] = [
  {path: '/admin', children: null, icon: <UserOutlined />, display_name: '管理员列表', roles: ['admin']},
];

const MenuComponentDef: RouterComponentItem[] = [
  {path: '/admin', component: Admin},
];


export {
  MenuItemDef, MenuComponentDef
};

export type {
  MenuType
}