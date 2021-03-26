import axios from 'axios';
import {message} from "antd";
import Auth from "./Auth";

const http = axios.create({
  baseURL: 'http://localhost:8000/admin',
  timeout: 10000,
});

type AuthHandler = (auth: Auth) => void;

class AuthUtil {
  private setAuth: AuthHandler | undefined;

  public setHandler(handler: AuthHandler) {
    this.setAuth = handler;
  }

  public set(auth: Auth): void {
    if (this.setAuth !== undefined) {
      this.setAuth(auth);
    } else {
      setTimeout(() => {this.set(auth)}, 500);
    }
  }

  public hasHandler(): boolean {
    return this.setAuth !== undefined;
  }
}

const globalAuth = new AuthUtil();

http.interceptors.response.use(res => {
  const {data} = res;
  if (res.status && res.status !== 200) {
    return Promise.reject(data.message || data.error);
  } else if (data.code === 0) {
    return data.data;
  } else if (data.code === 1) {
    return Promise.reject(data.msg);
  } else if (data.code === 2) {
    console.log(data.data);
    return Promise.reject(data.data);
  } else if (res.status === 401) {
    localStorage.clear();
    message.warning('登录态已失效，请重新登录');
    globalAuth.set({isAuthenticated: false, roles: []});
  } else if (res.status === 403) {
    message.warning('您无权限进行此操作');
    return Promise.reject(data);
  } else {
    console.log('http unknown response:', res);
    return Promise.reject(data.message);
  }
});



export {http, globalAuth};

