import {JsonResp} from "axios";

interface LoginResp {
  username: string;
  token: string;
  roles: Array<String>;
}


export type {LoginResp};