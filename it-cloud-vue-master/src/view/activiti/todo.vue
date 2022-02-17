<template>
  <div>
    <Card>
      <div>
        <!-- 搜索 -->
        <Form ref="formInline" :model="searchForm" inline :label-width="60">
          <FormItem prop="name" label="任务名称">
            <Input
              @on-change="handleClear"
              clearable
              placeholder="输入关键字搜索"
              class="search-input"
              v-model="searchTaskName"
            />
          </FormItem>
          <Button @click="handleSearch" class="search-btn" type="primary">
            <Icon type="ios-search" />搜索
          </Button>&nbsp;
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
    <Modal v-model="delegation_modal" title="委托" width="500" @on-cancel="cancel">
      <Form
        ref="delegationForm"
        :model="delegationForm"
        :rules="modelDelegationForm"
        :label-width="80"
      >
        <FormItem label="审批人" prop="userId">
          <Input type="text" v-model="delegationForm.userId" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="delegation">确认</Button>
      </div>
    </Modal>
    <!-- 审批MODAL -->
    <Modal v-model="approve_modal" title="审批" width="500" @on-cancel="cancel">
      <Form ref="approveForm" :model="approveForm" :label-width="80">
        <FormItem label="审批意见" prop="comment">
          <Input type="textarea" v-model="approveForm.comment" :autosize="{minRows: 3,maxRows: 6}" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="approve">确认</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getTodoTaskTableData } from '@/api/activiti'
import axios from '@/libs/api.request'

export default {
  name: 'todo_table_page',
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
      delegation_modal: false,
      delegationForm: {},
      approve_modal: false,
      approveForm: {},
      history_modal: false,
      info_modal: false,
      infoForm: {},
      searchTaskName: '',
      modelerUrl: '',
      design_modal: false,
      roleMenuData: [],
      roleMenuList: [],
      allot_role_id: '',
      menuList: [],
      allot_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      searchForm: {},
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
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
      modelDelegationForm: {
        userId: [
          {
            required: true,
            message: 'Please input the userId',
            trigger: 'blur'
          }
        ]
      },
      columns: [
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
        {
          title: '任务名称',
          key: 'task.name',
          width: 100,
          render: (h, params) => {
            return h('span', params.row.task.name)
          }        },
        { title: '申请人', key: 'userName', width: 100 },
        {
          title: '委托人',
          key: 'task.owner',
          width: 100,
          render: (h, params) => {
            return h('span', params.row.task.owner)
          }
        },
        {
          title: '处理人',
          key: 'task.assignee',
          width: 100,
          render: (h, params) => {
            return h('span', params.row.task.assignee)
          }
        },
        {
          title: '状态',
          key: 'suspensionState',
          width: 70,
          align: 'center',
          render: (h, params) => {
            let status = ''
            if (params.row.task.suspensionState == 1) {
              status = '运行'
            } else if (params.row.task.suspensionState == 2) {
              status = '暂停'
            } else {
              status = '未知'
            }
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.task.suspensionState == 1 ? "success" : params.row.task.suspensionState == 2 ?
                      "error" : "warn",
                    size: "small",
                    ghost: true
                  },
                  style: {
                    marginRight: "5px"
                  }
                }, status
              )
            ])
          }
        },
        { title: '请假类型', key: 'leaveType', width: 150 },
        {
          title: '创建时间',
          key: 'task.createTime',
          width: 150,
          render: (h, params) => {
            return h('span', params.row.task.createTime)
          }
        },
        {
          title: '操作',
          key: 'handle',
          fixed: 'right',
          width: 320,
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
                    display: params.row.suspensionState == 1 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showApprove(params.row.id, params.row.task.id, true)
                    }
                  }
                },
                '通过'
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
                    display: params.row.suspensionState == 1 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showApprove(params.row.id, params.row.task.id, false)
                    }
                  }
                },
                '拒绝'
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
                    display: params.row.task.assignee != null ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showClaim(params.row.task.id)
                    }
                  }
                },
                '签收'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                    // display: params.row.status != 0 ? 'none' : 'inline-block'
                  },
                  on: {
                    click: () => {
                      this.showDelegation(params.row.task.id)
                    }
                  }
                },
                '委托'
              ),
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
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
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showHistory(params.row)
                    }
                  }
                },
                '审批历史'
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
        taskName: this.searchTaskName
      }

      getTodoTaskTableData(params).then(res => {
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

      getTodoTaskTableData(params).then(res => {
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
      this.delegation_modal = false
      this.approve_modal = false
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
    showDelete (row) {
      this.delete_id = row.id
      this.delete_modal = true
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
    showApprove (id, taskId, flag) {
      this.approveForm.taskId = taskId
      this.approveForm.id = id
      this.approveForm.params = { 'flag': flag }
      this.approve_modal = true
    },
    showDelegation (taskId) {
      this.delegationForm.taskId = taskId
      this.delegation_modal = true
    },
    // 分割字符串
    maxSlice (v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + '...' : v
      }
    },
    // 审批
    approve () {
      if (this.approveForm.id == null || this.approveForm.id == '') {
        this.$Message.error("id不能为空")
        return;
      }
      if (this.approveForm.taskId == null || this.approveForm.taskId == '') {
        this.$Message.error("taskId不能为空")
        return;
      }

      this.modal_loading = true
      let comment = ''
      console.log(this.approveForm.params.flag)
      if (this.approveForm.params.flag) {
        comment += "【通过】"
      } else {
        comment += "【拒绝】"
      }
      if (this.approveForm.comment != null && this.approveForm.comment != '') {
        comment += this.approveForm.comment
      }
      axios
        .request({
          url: 'leave/task/complete',
          method: 'post',
          data: {
            id: this.approveForm.id,
            taskId: this.approveForm.taskId,
            comment: comment,
            params: this.approveForm.params
          }
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
          this.modal_loading = false
          this.approve_modal = false
        })

      this.approveForm = {}
    },
    // 委托
    delegation () {
      this.modal_loading = true
      this.$refs['delegationForm'].validate(valid => {
        if (valid) {
          axios
            .request({
              url: 'leave/task/entrust',
              method: 'get',
              params: {
                taskId: this.delegationForm.taskId,
                userId: this.delegationForm.userId
              }
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success('操作成功')
                this.refresh()
              } else {
                this.$Message.error(res.data.msg)
              }
              this.delegationForm = {}
              this.modal_loading = false
              this.delegation_modal = false
            })
        } else {
          this.modal_loading = false
          this.delegation_modal = false
          this.$Message.error('Fail!')
          return
        }
      })
    },
    showClaim (taskId) {
      this.$Modal.confirm({
        title: "提示",
        content: "请确认要签收该任务",
        okText: "确定",
        cancelText: "取消",
        loading: true,
        onOk () {
          axios
            .request({
              url: 'leave/task/claim/' +taskId,
              method: 'get'
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success('操作成功')
              } else {
                this.$Message.error(res.data.msg)
              }
              setTimeout(() => {
                //移除model
                this.$Modal.remove()
              }, 1000);
            })
        }
      });
    }
  }
}
</script>

<style>
</style>
