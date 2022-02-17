import axios from '@/libs/api.request'
// 模型列表
export const getModelTableData = (params) => {
  return axios.request({
    url: 'act/model/page',
    method: 'get',
    params: params
  })
}

// 流程定义列表
export const getProcdefTableData = (params) => {
  return axios.request({
    url: 'act/procdef/page',
    method: 'get',
    params: params
  })
}

// 我的申请列表
export const getMineTableData = (params) => {
  return axios.request({
    url: 'leave/mine',
    method: 'get',
    params: params
  })
}

// 流程审批历史列表
export const getHistoryTaskTableData = (id) => {
  return axios.request({
    url: 'leave/history/task/' + id,
    method: 'get'
  })
}

// 我的代办列表
export const getTodoTaskTableData = (params) => {
  return axios.request({
    url: 'leave/todo',
    method: 'get',
    params: params
  })
}

// 我的已办列表
export const getDoneTaskTableData = (params) => {
  return axios.request({
    url: 'leave/done',
    method: 'get',
    params: params
  })
}

// 运行中的流程列表
export const getRunningTaskTableData = (params) => {
  return axios.request({
    url: 'leave/running',
    method: 'get',
    params: params
  })
}

// 结束的流程列表
export const getFinishTaskTableData = (params) => {
  return axios.request({
    url: 'leave/finish',
    method: 'get',
    params: params
  })
}
