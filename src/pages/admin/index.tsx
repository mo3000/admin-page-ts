import React, {useState, useEffect} from 'react';
import {Card, Table, Form, Space, Input, Button, Divider, Modal, Radio, Checkbox, message, Badge} from "antd";
import {http} from '../../util';
import {AdminList, AdminListItem, RoleItem} from "../../iotypes/admin";
import dayjs from "dayjs";
import {Paginator} from "../../iotypes/paginator";

const {useForm} = Form;

const adminRoles = [
  {value: 'admin', label: '管理员'},
  {value: 'merchant', label: '商户'},
];

const addModalDefaultFields = {
  username: '', realname: '', password: '', roles: [],
};

const editModalDefaultFields = {
  id: 0, username: '', realname: '', roles: [],
};

interface AdminListQueryParam {
  username?: string;
  realname?: string;
}

interface AdminModelParam {
  id: number;
  username: string;
  roles: string[];
  realname: string;
}

export default function Admin() {
  const [list, setList] = useState<AdminList>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [paginator, setPaginator] = useState<Pick<Paginator<any>, 'page' | 'total'>>({page: 0, total: 0});
  const [search, setSearch] = useState<AdminListQueryParam>({username: '', realname: ''});
  const [searchForm] = useForm();
  const [editForm] = useForm();
  const [addForm] = useForm();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editModalFields, setEditModalFields] = useState<AdminModelParam>(editModalDefaultFields);

  function getList(values: AdminListQueryParam | null = null) {
    setTableLoading(true);
    const data = {...values, ...search};
    http.post<Paginator<AdminList>>('/admin/list', {
      page: paginator.page,
      ...data,
    })
      .then(data => {
        console.log('setList', data.data);
        setList(data.data);
        setPaginator({total: data.total, page: data.page});
        setTableLoading(false);
      })
      .catch(() => {
        setTableLoading(false);
      });
  }

  function onFormSubmit() {
    setPaginator({...paginator, page: 0});
    searchForm.validateFields()
      .then(values => {
        setSearch(values);
        getList(values);
      });
  }

  function onShowEditModal(values: AdminModelParam) {
    setEditModalFields(values);
    editForm.setFieldsValue(values);
    setShowEditModal(true);
  }
  function onAddFormSubmit() {
    addForm.validateFields()
      .then(values => {
        http.post('/admin/edit', values)
          .then(() => {
            message.success('添加成功');
            setShowAddModal(false);
            getList();
          });
      });
  }
  function onEditFormSubmit() {
    editForm.validateFields()
      .then(values => {
        http.post('/admin/edit', {...values, id: editModalFields.id})
          .then(() => {
            message.success('编辑成功');
            setShowEditModal(false);
            getList();
          });
      });
  }
  function toggleStatus(id: string) {
    http.post('/admin/toggle-status', {id})
      .then(() => {
        getList();
      })
      .catch(e => {
        message.error(e);
      });
  }
  function resetPassword(id: string) {
    http.post('/admin/reset-password', {id, password: '123456'})
      .then(() => {
        message.success('密码已重置为123456');
      })
      .catch(e => {
        message.error(e);
      });
  }
  useEffect(() => getList(), []);
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'realname',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (roles: RoleItem[]) => {
        return roles.map(role => role.display_name).join(',');
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (v: string) => {
        return dayjs(v).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: number) => {
        return <Badge status={v === 0 ? 'success' : 'error'} text={v === 0 ? '启用中' : '禁用中'}/>;
      }
    },
    {
      title: '操作',
      render: (v: any, row: AdminListItem) => {
        const id = String(row.id);
        return (<div>
          <Button onClick={() => toggleStatus(id)}>{row.status === 0 ? '禁用' : '启用'}</Button>
          <Divider type='vertical'/>
          <Button onClick={() => resetPassword(id)}>重置密码</Button>
          <Divider type='vertical'/>
          <Button onClick={() => onShowEditModal({
            id: row.id, username: row.username, realname: row.realname,
            roles: row.roles.map(role => role.name)
          })}>编辑</Button>
        </div>);
      }
    },
  ];
  return (<Space direction='vertical' style={{width: '100%'}}>
    <Card>
      <Form form={searchForm} layout='inline' onFinish={onFormSubmit}>
        <Form.Item label='用户名' name='username'>
          <Input/>
        </Form.Item>
        <Form.Item label='姓名' name='realname'>
          <Input/>
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary'>搜索</Button>
          <Divider type='vertical'/>
          <Button type='primary' onClick={() => setShowAddModal(true)}>添加</Button>
        </Form.Item>
      </Form>
    </Card>
    <Card>
      <Table dataSource={list} columns={columns} rowKey='id'
             loading={tableLoading} onChange={() => getList()}/>
    </Card>
    <Modal
      visible={showAddModal} title='添加管理员'
      onCancel={() => setShowAddModal(false)}
      okText='确定' cancelText='取消'
      onOk={onAddFormSubmit}
    >
      <Form name='addForm' form={addForm} initialValues={addModalDefaultFields}>
        <Form.Item name='username' label='用户名' rules={[
          {required: true, message: '用户名必填'},
          {min: 5, max: 20, message: '用户名在5-15位之间'}
        ]}>
          <Input />
        </Form.Item>
        <Form.Item name='realname' label='姓名' rules={[
          {required: true, message: '姓名必填'},
          {max: 15, message: '姓名在10位之内'}
        ]}>
          <Input/>
        </Form.Item>
        <Form.Item name='password' label='密码' rules={[
          {required: true, message: '密码必填'},
          {min: 6, max: 20, message: '密码在6-20位之间'}
        ]}>
          <Input/>
        </Form.Item>
        <Form.Item name='roles' label='角色' rules={[
          {required: true, message: '必须选择一个角色'},
        ]}>
          <Checkbox.Group options={adminRoles}/>
        </Form.Item>
      </Form>
    </Modal>
    <Modal
      visible={showEditModal} title='编辑管理员'
      onCancel={() => setShowEditModal(false)}
      okText='确定' cancelText='取消' onOk={onEditFormSubmit}
    >
      <Form name='editForm' form={editForm}>
        <Form.Item name='username' label='用户名'>
          <Input disabled />
        </Form.Item>
        <Form.Item name='realname' label='姓名' rules={[
          {required: true, message: '姓名必填'},
          {max: 15, message: '姓名在10位之内'}
        ]}>
          <Input/>
        </Form.Item>
        <Form.Item name='roles' label='角色' rules={[
          {required: true, message: '必须选择一个角色'},
        ]}>
          <Checkbox.Group options={adminRoles}/>
        </Form.Item>
      </Form>
    </Modal>
  </Space>);
}