import axios from '@/libs/api.request'

// export const login = ({ userName, password }) => {
//   const data = {
//     userName,
//     password
//   }
//   return axios.request({
//     url: 'login',
//     data,
//     method: 'post'
//   })
// }

export const login = ({ userName, password, captcha, uuid }) => {
  return axios.request({
    url: 'admin/login',
    data: {
      username: userName,
      password: password,
      captcha: captcha,
      uuid: uuid
    },
    method: 'post'
  })
}

// 获取用户信息
export const getUserInfo = (token) => {
  // TODO：写死了，可以从后台获取
  token = 'super_admin'
  return axios.request({
    url: 'get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'admin/logout',
    method: 'post'
  })
}

export const getUnreadCount = () => {
  return axios.request({
    url: 'message/count',
    method: 'get'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
