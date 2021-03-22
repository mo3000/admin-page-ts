import React, {ReactElement, SetStateAction, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Redirect, useHistory} from 'react-router-dom';
import {useState} from 'react';
import Auth from "./Auth";
import {http} from "./util";
import {message, Row, Select, Spin, Layout} from "antd";
import {SelectValue} from "antd/lib/select";

interface RouteParam {
  children: ReactElement;
  auth: Auth;
}

function PrivateRoute({children, auth, ...rest}: RouteParam) {
  return (
    <Route
      {...rest}
      render={({location}) => auth.isAuthenticated ? children : (
        <Redirect
          to={{
            pathname: "/login",
            state: {from: location}
          }}
        />
      )}
    />
  );
}

interface HeaderParam {
  setAuth: React.Dispatch<SetStateAction<Auth>>;
}

function Header({setAuth}: HeaderParam) {
  const history = useHistory();
  const onAvatarMenuChange = (v: SelectValue): void => {
    if (v === 'reset-password') {
      console.log('重置密码');
    } else if (v === 'logout') {
      localStorage.clear();
      setAuth({isAuthenticated: false, roles: []});
      history.replace('/login');
    }
  }

  const Option = Select.Option;

  return (
    <Layout.Header>
      <Row justify='space-between'>
        <span>
          <Select
            placeholder='快捷搜索' size='small'
            showArrow={false}
            notFoundContent={<Spin/>}
            style={{minWidth: 200}}
            showSearch>
          </Select>
        </span>
        <span>
          <Select size='middle' placeholder='头像'
                  defaultActiveFirstOption={false}
                  onChange={v => onAvatarMenuChange(v)}>
            <Option value='reset-password' key='resetPassword'>重置密码</Option>
            <Option value='logout' key='logout'>退出</Option>
          </Select>
        </span>
      </Row>
    </Layout.Header>
  );
}

function App() {
  const [auth, setAuth] = useState<Auth>({isAuthenticated: false, roles: []});
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const _roles = localStorage.getItem('admin-roles');
    const roles = _roles ? _roles.split(',') : [];
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (token && ! auth.isAuthenticated) {
      setAuth({isAuthenticated: true, roles: roles});
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    http.interceptors.response.use(res => {
      if (res.data.code === 0) {
        return res.data.data;
      } else if (res.data.code === 1) {
        return Promise.reject(res.data.msg);
      } else if (res.data.code === 2) {
        console.log(res.data.data);
        return Promise.reject('表单验证失败');
      } else if (res.status === 401) {
        localStorage.clear();
        message.warning('登录态已失效，请重新登录');
        setAuth({isAuthenticated: false, roles: []});
      } else if (res.status === 403) {
        message.error('您无权限进行此操作');
        return Promise.reject(res);
      } else {
        console.log('http unknown response:', res);
        return Promise.reject(res);
      }
    });
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
