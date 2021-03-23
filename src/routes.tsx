import {ReactComponentElement} from "react";

interface MenuType {
  path: string;
  children: Array<MenuType>;
  icon: string | ReactComponentElement<any>;
  display_name: string;
  roles: Array<string>;
}

const menus: Array<MenuType> = [];

export {
  menus
};

export type {
  MenuType
}