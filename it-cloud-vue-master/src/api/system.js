import axios from '@/libs/api.request'
// 任务列表
export const getScheduleTableData = (params) => {
  return axios.request({
    url: 'admin/schedule',
    method: 'get',
    params: params
  })
}

// 任务日志列表
export const getScheduleLogTableData = (params) => {
  return axios.request({
    url: 'admin/schedule/log',
    method: 'get',
    params: params
  })
}

// 系统日志列表
export const getSyslogTableData = (params) => {
  return axios.request({
    url: 'system/log',
    method: 'get',
    params: params
  })
}

// 文件列表
export const getOssData = (params) => {
  return axios.request({
    url: 'admin/oss',
    method: 'get',
    params: params
  })
}
