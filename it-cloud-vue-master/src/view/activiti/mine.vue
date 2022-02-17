<template>
  <div>
    <Card>
      <div>
        <!-- 搜索 -->
        <Form ref="formInline" :model="searchForm" inline :label-width="60">
          <FormItem prop="name" label="标题">
            <Input
              @on-change="handleClear"
              clearable
              placeholder="输入关键字搜索 "
              class="search-input"
              v-model="searchTitle"
            />
          </FormItem>
          <FormItem prop="key" label="请假类型">
            <Select v-model="searchLeaveType" style="width:100px">
              <Option v-for="item in typeList" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem label="起止时间" prop="daterange">
            <DatePicker
              type="datetimerange"
              placeholder="Select date and time"
              v-model="searchDaterange"
              style="width: 280px"
              split-panels
            ></DatePicker>
          </FormItem>

          <Button @click="handleSearch" class="search-btn" type="primary">
            <Icon type="ios-search" />搜索
          </Button>&nbsp;
          <Button @click="showInsert" class="search-btn" type="info">
            <Icon type="ios-add" />新增申请
          </Button>
        </Form>
      </div>
      <!-- 列表 -->
      <Table border stripe :columns="columns" :data="tableData" :loading="tableLoading"></Table>
      <div style="margin-top: 10px; text-align: right">
        <Page
          :total="total"
          show-sizer
          show-total
          :current="page"
          :page-size="pageSize"
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </div>
      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
    <!-- 流程设计 -->
    <Modal v-model="design_modal" fullscreen footer-hide title="流程设计">
      <div>
        <iframe
          :src="modelerUrl"
          scrolling="auto"
          frameborder="0"
          style="height: 665px;width: 100%;"
        ></iframe>
      </div>
      <div slot="footer"></div>
    </Modal>

    <!-- 添加MODAL -->
    <Modal v-model="insert_modal" title="添加申请" @on-cancel="cancel">
      <div>
        <Form ref="insertForm" :model="insertForm" :rules="modelInsertForm" :label-width="80">
          <FormItem label="标题" prop="title">
            <Input type="text" v-model="insertForm.title" />
          </FormItem>
          <FormItem label="请假类型" prop="leaveType">
            <Select v-model="insertForm.leaveType" style="width:405px">
              <Option v-for="item in typeList" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem label="起止时间" prop="daterange">
            <DatePicker
              type="datetimerange"
              placeholder="Select date and time"
              v-model="insertForm.daterange"
              style="width: 405px"
              split-panels
            ></DatePicker>
          </FormItem>
          <FormItem label="原因" prop="reason">
            <Input type="textarea" v-model="insertForm.reason" :autosize="{minRows: 3,maxRows: 6}" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="insert">确认</Button>
      </div>
    </Modal>
    <!-- 更新MODAL -->
    <Modal v-model="update_modal" title="更新申请" @on-cancel="cancel">
      <div>
        <Form ref="updateForm" :model="updateForm" :rules="modelInsertForm" :label-width="80">
          <FormItem label="标题" prop="title">
            <Input type="text" v-model="updateForm.title" />
          </FormItem>
          <FormItem label="请假类型" prop="leaveType">
            <Select v-model="updateForm.leaveType" style="width:405px">
              <Option v-for="item in typeList" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem label="起止时间" prop="daterange">
            <DatePicker
              type="datetimerange"
              placeholder="Select date and time"
              v-model="updateForm.daterange"
              style="width: 405px"
              split-panels
            ></DatePicker>
          </FormItem>
          <FormItem label="原因" prop="reason">
            <Input type="textarea" v-model="updateForm.reason" :autosize="{minRows: 3,maxRows: 6}" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="update">确认</Button>
      </div>
    </Modal>
    <!-- 表单数据MODAL -->
    <Modal v-model="info_modal" title="更新申请" @on-cancel="cancel">
      <div>
        <Form ref="infoForm" :model="infoForm" :label-width="80">
          <FormItem label="ID" prop="id">
            <span>{{infoForm.id}}</span>
          </FormItem>
          <FormItem label="标题" prop="title">
            <Input type="text" v-model="infoForm.title" disabled />
          </FormItem>
          <FormItem label="请假类型" prop="leaveType">
            <Select v-model="infoForm.leaveType" style="width:405px" disabled>
              <Option v-for="item in typeList" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem label="起止时间" prop="daterange">
            <DatePicker
              type="datetimerange"
              placeholder="Select date and time"
              v-model="infoForm.daterange"
              style="width: 405px"
              split-panels
              disabled
            ></DatePicker>
          </FormItem>
          <FormItem label="原因" prop="reason">
            <Input
              type="textarea"
              v-model="infoForm.reason"
              :autosize="{minRows: 3,maxRows: 6}"
              disabled
            />
          </FormItem>
        </Form>
      </div>
      <!-- <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="update">确认</Button>
      </div>-->
    </Modal>
    <!-- 提示MODAL -->
    <Modal v-model="delete_modal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>Delete confirmation</span>
      </p>
      <div style="text-align:center">
        <p>删除后将无法恢复</p>
        <p>你确定要删除？</p>
      </div>
      <input type="hidden" v-model="delete_id" />
      <div slot="footer">
        <Button type="error" size="large" long :loading="modal_loading" @click="delConfirm">删除</Button>
      </div>
    </Modal>
    <!-- 提交申请MODAL -->
    <Modal v-model="apply_modal" title="提示" width="500" @on-cancel="cancel">
      <Form ref="applyForm" :model="applyForm" :rules="modelApplyForm" :label-width="100">
        <FormItem label="上级审批人" prop="users" >
          <Input type="text" v-model="applyForm.users" />
        </FormItem>
        <input type="hidden" v-model="apply_id" />
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="apply">确认</Button>
      </div>
    </Modal>
    <!-- 表单数据MODAL -->
    <Modal v-model="history_modal" title="审批历史" @on-cancel="cancel" width="800">
      <div>
        <Row>
          <Card>
            <p slot="title">The standard card</p>
            <p>Content of card</p>
            <p>Content of card</p>
            <p>Content of card</p>
          </Card>
        </Row>
        <br />
        <Row>
          <Card>
            <p slot="title">The standard card</p>
            <p>Content of card</p>
            <p>Content of card</p>
            <p>Content of card</p>
          </Card>
        </Row>
      </div>
    </Modal>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getMineTableData } from '@/api/activiti'
import axios from '@/libs/api.request'
import { treeDataTranslate, buildTree } from '@/libs/util'

export default {
  name: 'minetask_table_page',
  components: {
    Tables
  },
  data () {
    // 校验规则器
    const validateTitle = (rule, value, callback) => {
      if (!value) {
        callback(new Error('title cannot be empty'))
      } else {
        callback()
      }
    }

    return {
      tableLoading: true,
      searchDaterange: [],
      history_modal: false,
      info_modal: false,
      infoForm: {},
      update_modal: false,
      updateForm: {},
      applyForm: {},
      apply_modal: false,
      apply_id: '',
      searchTitle: '',
      searchLeaveType: '',
      searchName: '',
      searchKey: '',
      modelerUrl: '',
      design_modal: false,
      roleMenuData: [],
      roleMenuList: [],
      allot_role_id: '',
      menuList: [],
      allot_modal: false,
      insertForm: {},
      insert_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      updateForm: {},
      searchForm: {},
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      update_modal: false,
      typeList: [
        {
          value: '年假',
          key: 'annualLeave'
        },
        {
          value: '事假',
          key: 'personalLeave'
        },
        {
          value: '病假',
          key: 'sickLeave'
        },
        {
          value: '调休',
          key: 'daysOffLeave'
        },
        {
          value: '产假',
          key: 'maternityLeave'
        },
        {
          value: '婚假',
          key: 'maritalLeave'
        }
      ],
      modelApplyForm: {
        users: [
          {
            required: true,
            message: 'Please input the users',
            trigger: 'blur'
          }
        ]
      },
      ruleUpdateForm: {
        title: [{ validator: validateTitle, trigger: 'blur' }],
        key: [
          {
            required: true,
            message: 'Please input the key',
            trigger: 'blur'
          }
        ]
      },
      modelInsertForm: {
        title: [{ validator: validateTitle, trigger: 'blur' }],
        leaveType: [
          {
            required: true,
            message: 'Please select the type',
            trigger: 'change'
          }
        ],
        reason: [
          {
            required: true,
            message: 'Please input the reason',
            trigger: 'blur'
          }
        ]
      },
      searchColumns: [{ title: '角色名', key: 'roleName' }],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '序号',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + (this.page - 1) * this.pageSize + 1)
          }
        },
        {
          title: '标题',
          key: 'title',
          width: 200,
          render: (h, params) => {
            return h(
              'Tooltip',
              {
                props: { placement: 'top' }
              },
              [
                this.maxSlice(params.row.title),
                h(
                  'span',
                  {
                    slot: 'content',
                    style: { whiteSpace: 'normal', wordBreak: 'break-all' }
                  },
                  params.row.title
                )
              ]
            )
          }
        },
        { title: '申请人', key: 'userName', width: 100 },
        {
          title: '当前任务节点',
          // key: 'taskList',
          width: 150,
          render: (h, params) => {
            const taskList = params.row.taskList
            var currentTask = ''
            if (!(taskList == null || taskList.size == 0)) {
              for (var i = 0; i < taskList.length; i++) {
                currentTask += taskList[i].name + ' |'
              }
            }
            return h('div', [
              h('span', {}, currentTask.substr(0, currentTask.length - 1))
            ])
          }
        },
        {
          title: '状态',
          key: 'status',
          width: 90,
          align: 'center',
          render: (h, params) => {
            let status = ''
            if (params.row.status == 0) {
              status = '草稿'
            } else if (params.row.status == 1) {
              status = '已提交'
            } else {
              status = '结束'
            }
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type:
                      params.row.status == 0
                        ? 'info'
                        : params.row.status == 1
                          ? 'success'
                          : 'warning',
                    size: 'small',
                    ghost: true
                  },
                  style: {
                    marginRight: '5px'
                  }
                },
                status
              )
            ])
          }
        },
        { title: '天数', key: 'days', width: 70 },
        { title: '请假类型', key: 'leaveType', width: 150 },
        { title: '开始时间', key: 'startTime', width: 150 },
        { title: '结束时间', key: 'endTime', width: 150 },
        { title: '创建时间', key: 'createTime', width: 150 },
        { title: '提交时间', key: 'updateTime', width: 150 },
        {
          title: '操作',
          key: 'handle',
          fixed: 'right',
          width: 300,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status != 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showApply(params.row)
                    }
                  }
                },
                '提交申请'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status != 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showEdit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status == 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showInfo(params.row)
                    }
                  }
                },
                '表单数据'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status == 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showHistory(params.row)
                    }
                  }
                },
                '审批历史'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.status != 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showDelete(params.row)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      tableData: []
    }
  },
  mounted () {
    this.loadTableData()
  },
  methods: {
    handleDelete (row) {
      this.delete_modal = true
      this.delete_id = row.id
    },
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
      })
    },
    // 搜索
    handleSearch () {
      this.tableLoading = true
      let params = {
        page: this.page,
        limit: this.pageSize,
        title: this.searchTitle,
        leaveType: this.searchLeaveType
      }

      // 设置时间
      var timeArray = this.searchDaterange
      if (!(timeArray[0] == '' || timeArray[1] == null)) {
        // 时间处理
        var startTime = new Date(timeArray[0]).getTime()
        var endTime = new Date(timeArray[1]).getTime()
        // 动态设置参数
        this.$set(params, "startTime", startTime)
        this.$set(params, "endTime", endTime)
      }

      getMineTableData(params).then(res => {
        if (res.data.success) {
          this.tableLoading = false
          this.tableData = res.data.data.list
          this.total = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    handleClear (e) {
      if (e.target.value === '') this.insideTableData = this.value
    },
    loadTableData () {
      this.tableLoading = true
      let params = {
        page: this.page,
        limit: this.pageSize
      }

      getMineTableData(params).then(res => {
        if (res.data.success) {
          this.tableLoading = false
          this.tableData = res.data.data.list
          this.total = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    cancel () {
      this.update_modal = false
      this.insert_modal = false
      this.allot_modal = false
    },
    // 分页
    pageChange (index) {
      this.page = index
      this.loadTableData()
    },
    // 每页行数切换
    pageSizeChange (index) {
      this.pageSize = index
      this.loadTableData()
    },
    // 删除确认
    delConfirm () {
      if (!this.delete_id) {
        this.$Message.success('删除ID不能为空')
        return
      }
      this.modal_loading = true
      axios
        .request({
          url: 'leave/' + this.delete_id,
          method: 'delete'
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })

      this.modal_loading = false
      this.delete_modal = false
    },
    refresh () {
      this.loadTableData()
    },
    showInsert () {
      this.insert_modal = true
    },
    showDelete (row) {
      this.delete_id = row.id
      this.delete_modal = true
    },
    showEdit (row) {
      this.updateForm = row
      var daterange = []
      daterange.push(row.startTime)
      daterange.push(row.endTime)
      this.updateForm.daterange = daterange
      this.update_modal = true
    },
    showInfo (row) {
      this.infoForm = row
      var daterange = []
      daterange.push(row.startTime)
      daterange.push(row.endTime)
      this.infoForm.daterange = daterange
      this.info_modal = true
    },
    showHistory (row) {
      this.$router.push({
        path: '/activiti/history_approve_page',
        key: new Date().getTime,
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          id: row.id
        }
      })
      // this.history_modal = true
    },
    showApply (row) {
      this.apply_id = row.id
      this.apply_modal = true
    },
    // 添加
    insert () {
      this.modal_loading = true
      var timeArray = this.insertForm.daterange
      if (timeArray[0] == '' || timeArray[1] == null) {
        this.$Message.error('请选择日期')
        this.modal_loading = false
        return false
      }
      // 时间处理
      var startTime = new Date(timeArray[0]).getTime()
      var endTime = new Date(timeArray[1]).getTime()
      var days = (endTime - startTime) / (3600 * 24 * 1000)
      this.$refs['insertForm'].validate(valid => {
        if (valid) {
          axios
            .request({
              url: 'leave',
              method: 'post',
              data: {
                title: this.insertForm.title,
                leaveType: this.insertForm.leaveType,
                reason: this.insertForm.reason,
                startTime: startTime,
                endTime: endTime,
                days: days
              }
            })
            .then(res => {
              if (res.data.success) {
                this.modal_loading = false
                this.insert_modal = false
                this.$Message.success('操作成功')
                this.refresh()
              } else {
                this.modal_loading = false
                this.insert_modal = false
                this.$Message.error(res.data.msg)
              }
            })
        } else {
          this.$Message.error('Fail!')
          return
        }
      })
    },
    // 添加
    update () {
      this.modal_loading = true
      var timeArray = this.updateForm.daterange
      if (timeArray[0] == '' || timeArray[1] == null) {
        this.$Message.error('请选择日期')
        this.modal_loading = false
        return false
      }
      // 时间处理
      var startTime = new Date(timeArray[0]).getTime()
      var endTime = new Date(timeArray[1]).getTime()
      var days = (endTime - startTime) / (3600 * 24 * 1000)
      this.$refs['updateForm'].validate(valid => {
        if (valid) {
          axios
            .request({
              url: 'leave',
              method: 'put',
              data: {
                id: this.updateForm.id,
                title: this.updateForm.title,
                leaveType: this.updateForm.leaveType,
                reason: this.updateForm.reason,
                startTime: startTime,
                endTime: endTime,
                days: days
              }
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success('操作成功')
                this.refresh()
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          this.updateForm = {}
          this.modal_loading = false
          this.update_modal = false
        } else {
          this.$Message.error('Fail!')
          return
        }
      })
    },
    dateFormat (time) {
      var date = new Date(time)
      var year = date.getFullYear()
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month =
        date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1
      var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      var minutes =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      var seconds =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      // 拼接
      return (
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hours +
        ':' +
        minutes +
        ':' +
        seconds
      )
    },
    modelCancel () {
      // this.$Message.info('Clicked cancel');
      this.$Modal.info({
        title: '提示',
        content: '请确认点击了左上角的保存按钮'
      })
    },
    export (row) {
      // window.location.href = url; // 本窗口打开下载
      // window.open('act/model/export?id='+row.id, '_blank'); // 新开窗口下载
      axios
        .request({
          url: 'act/model/export',
          method: 'get',
          responseType: 'blob', // 设置响应数据类型
          params: {
            id: row.id
          }
        })
        .then(res => {
          this.download(res)
        })
    },
    // 下载文件
    download (res) {
      let data = res.data
      if (!data) {
        return
      }
      const fileName = '模型.xml'
      const blob = new Blob([data])
      if (window.navigator.msSaveOrOpenBlob) {
        // 兼容IE10
        navigator.msSaveBlob(blob, fileName)
      } else {
        // 其他非IE内核支持H5的浏览器
        let url = window.URL.createObjectURL(blob)
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
      }
    },
    // 分割字符串
    maxSlice (v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + '...' : v
      }
    },
    // 添加
    apply () {
      this.modal_loading = true
      this.$refs['applyForm'].validate(valid => {
        if (valid) {
          axios
            .request({
              url: 'leave/apply',
              method: 'post',
              data: {
                id: this.apply_id,
                users: this.applyForm.users
              }
            })
            .then(res => {
              if (res.data.success) {
                this.modal_loading = false
                this.$Message.success('操作成功')
                this.refresh()
                this.apply_modal = false
              } else {
                this.modal_loading = false
                this.$Message.error(res.data.msg)
                this.apply_modal = false
              }
            })
            
          this.apply_id = ''
        } else {
          this.modal_loading = false
          this.$Message.error('Fail!')
          return
        }
      })
    }
  }
}
</script>

<style>
</style>
