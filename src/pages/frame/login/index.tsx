import {useState} from 'react';
import React from 'react';
import {Form, Button, Input, Layout, Row, message} from "antd";
import {http} from "../../../util";
import {useHistory} from "react-router";
import Auth from "../../../Auth";
import {LoginResp} from '../../../iotypes/frame';

const {Item, useForm} = Form;
const {Content} = Layout;

interface LoginFormParam {
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
}

export default function LoginForm({setAuth}: LoginFormParam) {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = useForm();
  const history = useHistory();
  function login() {
    form.validateFields()
      .then(values => {
        setLoading(true);
        http.post<LoginResp>('/login', {username: values.username, password: values.password})
          .then(data => {
            console.log('login', data);
            setLoading(false);
            localStorage.setItem('admin-token', data.token);
            localStorage.setItem('admin-roles', data.roles.join(','));
            setAuth({isAuthenticated: true, roles: data.roles});
            message.success('登录成功');
            history.replace('/');
          })
          .catch(msg => {
            setLoading(false);
            message.error(msg);
          });
      })
      .catch(info => {
        console.log('validate error', info);
      });
  }
  return (
    <Layout>
      <Layout>
        <Content>
          <Row justify='center'>
            <h2>欢迎</h2>
          </Row>
          <Form labelCol={{span: 8}} wrapperCol={{span: 8}} form={form}>
            <Item label='用户名' name='username' rules={[
              {required: true, message: '必须填写用户名'},
              {min: 3, message: '用户名太短'}
            ]}>
              <Input />
            </Item>
            <Item label='密码' name='password' rules={[
              {required: true, message: '必须填写密码'},
              {min: 6, message: '密码太短'}
            ]}>
              <Input.Password />
            </Item>
            <Item wrapperCol={{offset: 8, span: 8}}>
              <Button type="primary" htmlType="submit" onClick={() => login()} loading={loading}>登录</Button>
            </Item>
          </Form>
        </Content>
      </Layout>
    </Layout>

  );
}