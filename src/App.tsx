import React, {ReactComponentElement, SetStateAction, useEffect, useState} from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Redirect, useHistory} from 'react-router-dom';
import Auth from "./Auth";
import {http} from "./util";
import {message, Row, Select, Spin, Layout} from "antd";
import {SelectValue} from "antd/lib/select";
import LoginForm from "./pages/frame/login";
import AdminMenu from "./pages/frame/menu";
import {MenuComponentDef, MenuItemDef} from "./routes";

interface RouteParam {
  children: ReactComponentElement<any>;
  auth: Auth;
  path: string;
}

function PrivateRoute({children, auth, ...rest}: RouteParam) {
  console.log('PrivateRoute', rest);
  return <Route
    {...rest}
    render={({location}) => {
      console.log('in route', location);
      console.log('in route', auth);
      console.log('in route', rest);
      return auth.isAuthenticated ? children : (
        <Redirect
          to={{
            pathname: "/login",
            state: {from: location}
          }}
        />
      )
    }}
  />;
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

// @ts-ignore
function LoginRoutes({setAuth, auth}) {
  return <Layout>
    <Header setAuth={setAuth} />
    <Layout>
      <Layout.Sider breakpoint='sm'>
        <AdminMenu menuContent={MenuItemDef} auth={auth}/>
      </Layout.Sider>
      <Layout.Content style={{minHeight: 600}}>
        <Switch>
          {MenuComponentDef.map((route, i) => {
              console.log('MenuComponentDef', route);
              return (<PrivateRoute auth={auth} key={i} path={route.path}>
                <route.component />
              </PrivateRoute>);
            }
          )}
        </Switch>
      </Layout.Content>
    </Layout>
    <Layout.Footer style={{backgroundColor: "lightblue"}}>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ footer ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    </Layout.Footer>
  </Layout>
}


function App() {
  const [auth, setAuth] = useState<Auth>({isAuthenticated: false, roles: []});
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const _roles = localStorage.getItem('admin-roles');
    const roles = _roles ? _roles.split(',') : [];
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (token) {
      setAuth({isAuthenticated: true, roles: roles});
    }
  }, []);

  useEffect(() => {
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
        setAuth({isAuthenticated: false, roles: []});
      } else if (res.status === 403) {
        message.warning('您无权限进行此操作');
        return Promise.reject(data);
      } else {
        console.log('http unknown response:', res);
        return Promise.reject(data.message);
      }
    });
  }, []);

  return (
    <Router>
      <Switch>
        <Route path='/login' exact>
          <LoginForm setAuth={setAuth}/>
        </Route>
        <LoginRoutes setAuth={setAuth} auth={auth} />
      </Switch>
    </Router>
  );
}

export default App;
