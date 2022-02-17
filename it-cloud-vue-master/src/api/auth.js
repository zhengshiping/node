import axios from '@/libs/api.request'
// 用户列表
export const getUserTableData = (params) => {
  return axios.request({
    url: 'admin/user',
    method: 'get',
    params: params
  })
}

// 角色列表--分页
export const getRoleTableData = (params) => {
  return axios.request({
    url: 'admin/role',
    method: 'get',
    params: params
  })
}

// 所有角色列表
export const getRoleListData = () => {
  return axios.request({
    url: 'admin/role/list',
    method: 'get'
  })
}

// 根据用户ID获取角色列表
export const getRoleListDataByUser = (params) => {
  return axios.request({
    url: 'admin/role/user/list',
    method: 'get',
    params: params
  })
}

// 菜单列表
export const getMenuTableData = (params) => {
  return axios.request({
    url: 'admin/menu/list',
    method: 'get',
    params: params
  })
}

// 根据角色ID获取菜单列表
export const getMenuListDataByRole = (params) => {
  return axios.request({
    url: 'admin/menu/role/list',
    method: 'get',
    params: params
  })
}

// 菜单下拉列表
export const getMenuSelectTableData = (params) => {
  return axios.request({
    url: 'admin/menu/select',
    method: 'get',
    params: params
  })
}

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

export const uploadImg = formData => {
  return axios.request({
    url: 'image/upload',
    data: formData
  })
}

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  })
}

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  })
}
