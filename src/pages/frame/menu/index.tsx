import { Menu } from 'antd';
import React from 'react';
import {useHistory, useLocation} from "react-router-dom";
import Auth from "../../../Auth";
import {MenuType} from "../../../routes";
import MenuItem from "antd/lib/menu/MenuItem";


interface AdminMenuParam {
  menuContent: Array<MenuType>;
  auth: Auth;
}

interface MenuInfo {
  key: React.Key;
  keyPath: React.Key[];
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement>;
}


export default function AdminMenu({menuContent, auth}: AdminMenuParam) {
  const history = useHistory();
  const location = useLocation();
  function onClick({key}: MenuInfo): void {
    if (key !== location.pathname) {
      history.push(`${key}`);
    }
  }
  function expand(menus: Array<MenuType>): Array<Partial<MenuItem> | null> {
    return menus.map(m => {
      if (auth.roles.length === 0) {
        return null;
      } else if (m.roles.length > 0) {
        if (! m.roles.some(role => auth.roles.indexOf(role) >= 0)) {
          return null;
        }
      }
      return (m.children == null) ?
        <Menu.Item key={m.path} title={m.display_name} icon={m.icon}>{m.display_name}</Menu.Item>
        :
        <Menu.SubMenu key={m.path} title={m.display_name} icon={m.icon}>{expand(m.children)}</Menu.SubMenu>
    })
      .filter(m => m != null);
  }
  return (
    <Menu
      mode='inline' onClick={onClick}
      defaultSelectedKeys={[location.pathname]}
      // defaultOpenKeys={defaultOpenKeys}
    >
      {expand(menuContent)}
    </Menu>
  );
}