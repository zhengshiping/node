<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Select v-model="searchKey" class="search-col">
          <Option
            v-for="item in searchColumns"
            :value="item.key"
            :key="`search-col-${item.key}`"
          >{{ item.title }}</Option>
        </Select>
        <Input
          @on-change="handleClear"
          clearable
          placeholder="输入关键字搜索"
          class="search-input"
          v-model="searchValue"
        />
        <Button @click="loadTableData" class="search-btn" type="primary">
          <Icon type="search" />搜索
        </Button>
        <Button @click="showInsert" class="search-btn" type="success">
          <Icon type="search" />添加
        </Button>
        <Button @click="batchPause" class="search-btn" type="warning" :loading="btn_loading">
          <Icon type="delete" />批量暂停
        </Button>
        <Button @click="batchResume" class="search-btn" type="primary" :loading="btn_loading">
          <Icon type="delete" />批量恢复
        </Button>
        <Button @click="batchRun" class="search-btn" type="success" :loading="btn_loading">
          <Icon type="delete" />批量立即执行
        </Button>
        <Button @click="showLog" class="search-btn" type="info">
          <Icon type="delete" />操作日志
        </Button>
      </div>
      <Table
        stripe
        ref="tables"
        :data="tableData"
        :columns="columns"
        :loading="tableLoading"
        @on-select="handleSelectRow()"
      />
      <div style="margin-top: 10px; text-align: right">
        <Page
          :total="total"
          show-sizer
          show-total
          :current="page"
          :page-size="pageSize"
          :loading="tableLoading"
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </div>
      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
    <!-- 更新MODAL -->
    <Modal v-model="update_modal" title="修改" @on-cancel="cancel">
      <div>
        <Form ref="updateForm" :model="updateForm" :rules="ruleUpdateForm" :label-width="80">
          <FormItem label="Bean" prop="beanName" placeholder="Spring Bean名称">
            <Input type="text" v-model="updateForm.beanName" />
          </FormItem>
          <FormItem label="参数" prop="params">
            <Input type="text" v-model="updateForm.params" />
          </FormItem>
          <FormItem label="Cron表达式" prop="cronExpression">
            <Input type="text" v-model="updateForm.cronExpression" />
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="updateForm.remark" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="update">确认</Button>
      </div>
    </Modal>

    <!-- 添加MODAL -->
    <Modal v-model="insert_modal" title="添加" @on-cancel="cancel">
      <div>
        <Form ref="insertForm" :model="insertForm" :rules="ruleInsertForm" :label-width="80">
          <FormItem label="Bean" prop="beanName" placeholder="Spring Bean名称">
            <Input type="text" v-model="insertForm.beanName" />
          </FormItem>
          <FormItem label="参数" prop="params">
            <Input type="text" v-model="insertForm.params" />
          </FormItem>
          <FormItem label="Cron表达式" prop="cronExpression">
            <Input type="text" v-model="insertForm.cronExpression" />
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="insertForm.remark" />
          </FormItem>
          <FormItem label="状态" prop="status">
            <RadioGroup v-model="insertForm.status">
              <Radio :label="0">运行</Radio>
              <Radio :label="1">暂停</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="insert">确认</Button>
      </div>
    </Modal>

    <!-- 日志MODAL -->
    <Modal
      v-model="log_modal"
      title="日志列表"
      @on-cancel="cancel"
      :styles="{top: '20px'}"
      width="1000"
      height="1000"
      :loading="log_modal_loading"
    >
      <div>
        <Table stripe ref="logTables" :data="logTableData" :columns="logColumns" />
        <div style="margin-top: 10px; text-align: right">
          <Page
            :total="logTotal"
            show-sizer
            show-total
            show-elevator
            :current="logPage"
            :page-size="logPageSize"
            :loading="tableLogLoading"
            @on-change="logPageChange"
            @on-page-size-change="logPageSizeChange"
          />
        </div>
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
        <p>你确定要删除该用户？</p>
      </div>
      <input type="hidden" v-model="delete_id" />
      <div slot="footer">
        <Button type="error" size="large" long :loading="modal_loading" @click="delConfirm">删除</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getScheduleTableData, getScheduleLogTableData } from '@/api/system'
import axios from '@/libs/api.request'

export default {
  name: 'user_table_page',
  components: {
    Tables
  },
  data () {
    return {
      tableLogLoading: true,
      tableLoading: true,
      log_modal_loading: false,
      logTableData: [],
      // log分页信息
      logPage: 1,
      logPageSize: 10,
      logTotal: 0,
      log_modal: false,
      btn_loading: false,
      selectIds: [],
      allot_user_id: '',
      roleList: [],
      userRoleList: [],
      insertForm: { status: 0 },
      insert_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      updateForm: {},
      tableData: [],
      searchValue: '',
      searchKey: 'beanName',
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      update_modal: false,
      ruleUpdateForm: {
        beanName: [
          {
            required: true,
            message: 'Please input the beanName',
            trigger: 'blur'
          }
        ],
        cronExpression: [
          {
            required: true,
            message: 'Please input the cronExpression',
            trigger: 'blur'
          }
        ]
      },
      ruleInsertForm: {
        beanName: [
          {
            required: true,
            message: 'Please input the beanName',
            trigger: 'blur'
          }
        ],
        cronExpression: [
          {
            required: true,
            message: 'Please input the cronExpression',
            trigger: 'blur'
          }
        ]
      },
      searchColumns: [
        { title: 'Bean', key: 'beanName' }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '序号',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + (this.page - 1) * this.pageSize + 1)
          }
        },
        { title: 'Bean', key: 'beanName' },
        { title: '参数', key: 'params' },
        { title: 'Cron表达式', key: 'cronExpression' },
        {
          title: '状态',
          // key: 'status',
          align: 'center',
          // width: '120px',
          render: (h, params) => {
            let status = ''
            if (params.row.status == 0) {
              status = '运行'
            } else if (params.row.status == 1) {
              status = '暂停'
            } else {
              status = '其他'
            }
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.status == 0 ? "success" : params.row.status == 1 ? "error" : "warn",
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
        { title: '备注', key: 'remark' },
        {
          title: '操作',
          key: 'handle',
          // options: ['delete'],
          width: 300,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.showUpdate(params.row)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.handleDelete(params.row)
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small',
                  loading: this.btn_loading
                },
                style: {
                  marginRight: '5px',
                  display: (params.row.status == 1) ? "none" : "inline-block"
                },
                on: {
                  click: () => {
                    this.pause(params.row)
                  }
                }
              }, '暂停'),
              h('Button', {
                props: {
                  type: 'info',
                  size: 'small',
                  loading: this.btn_loading
                },
                style: {
                  marginRight: '5px',
                  display: (params.row.status == 0) ? "none" : "inline-block"
                },
                on: {
                  click: () => {
                    this.resume(params.row)
                  }
                }
              }, '恢复'),
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small',
                  loading: this.btn_loading
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.run(params.row)
                  }
                }
              }, '立即执行')
            ]);
          }
        }
      ],
      logColumns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + (this.logPage - 1) * this.logPageSize + 1)
          }
        },
        { title: '任务ID', key: 'jobId' },
        { title: 'Bean', key: 'beanName' },
        { title: '参数', key: 'params' },
        {
          title: '状态',
          // key: 'status',
          align: 'center',
          // width: '120px',
          render: (h, params) => {
            let status = ''
            if (params.row.status == 0) {
              status = '成功'
            } else if (params.row.status == 1) {
              status = '失败'
            } else {
              status = '其他'
            }
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.status == 0 ? "success" : params.row.status == 1 ? "error" : "warn",
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
        { title: '耗时(ms)', key: 'times' },
        {
          title: '错误信息',
          key: 'error',
          width: 200,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
                this.maxSlice(params.row.error),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.error)
              ])
          }
        },
        { 
          title: '执行时间', 
          key: 'createTime',
          width: 150, 
          
        }
      ]

    }
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
    showUpdate (row) {
      this.updateForm = row
      this.update_modal = true
    },
    showLog (row) {
      this.log_modal = true
      this.loadLogTableData()
    },
    // 日志列表
    loadLogTableData () {
      this.tableLogLoading = true
      this.log_modal_loading = true

      let params = {
        page: this.logPage,
        limit: this.logPageSize
      }
      getScheduleLogTableData(params).then(res => {
        if (res.data.success) {
          this.tableLogLoading = false
          this.logTableData = res.data.data.list
          this.logTotal = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
      this.log_modal_loading = false
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
      // 动态设置参数
      let key = this.searchKey
      this.$set(params, key, this.searchValue)

      getScheduleTableData(params).then(res => {
        if (res.data.success) {
          this.tableLoading = false
          this.tableData = res.data.data.list
          this.total = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    update () {
      this.modal_loading = true
      this.$refs['updateForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/schedule',
              method: 'put',
              data: {
                id: this.updateForm.id,
                beanName: this.updateForm.beanName,
                params: this.updateForm.params,
                cronExpression: this.updateForm.cronExpression,
                status: this.updateForm.status
              }
            })
            .then(res => {
              if (res.data.success) {
                this.$Message.success('操作成功')
                this.update_modal = false
                this.refresh()
              } else {
                this.update_modal = false
                this.$Message.error(res.data.msg)
              }
            })
          this.updateForm = {}
        } else {
          this.$Message.error('Fail!')
          return
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
    // 分页
    logPageChange (index) {
      this.logPage = index
      this.loadLogTableData()
    },
    // 每页行数切换
    logPageSizeChange (index) {
      this.logPageSize = index
      this.loadLogTableData()
    },
    // 删除确认
    delConfirm () {
      if (!this.delete_id) {
        this.$Message.success('删除ID不能为空')
        return
      }
      this.modal_loading = true
      //参数，数组
      var ids = [this.delete_id]

      axios
        .request({
          url: 'admin/schedule/delete',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })

      setTimeout(() => {
        this.modal_loading = false;
        this.delete_modal = false;
      }, 1000);
    },
    refresh () {
      this.loadTableData()
    },
    showInsert () {
      this.insert_modal = true
    },
    // 添加
    insert () {
      this.modal_loading = true
      this.$refs['insertForm'].validate(valid => {
        if (valid) {
          axios
            .request({
              url: 'admin/schedule',
              method: 'post',
              data: {
                beanName: this.insertForm.beanName,
                params: this.insertForm.params,
                cronExpression: this.insertForm.cronExpression,
                status: this.insertForm.status
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
          this.insert_modal = false
          // 清空数据
          // this.insertForm = {}
        } else {
          this.$Message.error('Fail!')
        }
        this.modal_loading = false
      })
    },
    // 多选
    handleSelectRow () {
      let ids = [];
      this.$refs['tables'].getSelection().map(item => {
        ids.push(item.id)
      })
      // this.selectIds = ids
      console.log(ids)
      return ids
    },
    // 暂停
    pause (row) {
      this.btn_loading = true
      if (row.status != 0) {
        this.$Message.error('任务当前状态不能暂停')
        this.btn_loading = false
        return
      }
      if (!row.id) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }
      //参数，数组
      var ids = [row.id]

      axios
        .request({
          url: 'admin/schedule/pause',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    // 批量暂停
    batchPause () {
      this.btn_loading = true
      //参数，数组
      var ids = this.handleSelectRow()
      if (!ids) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }

      axios
        .request({
          url: 'admin/schedule/pause',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    // 恢复
    resume (row) {
      this.btn_loading = true
      if (row.status != 1) {
        this.$Message.error('任务当前状态不能恢复')
        this.btn_loading = false
        return
      }
      if (!row.id) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }
      //参数，数组
      var ids = [row.id]

      axios
        .request({
          url: 'admin/schedule/resume',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    // 批量恢复
    batchResume () {
      this.btn_loading = true
      //参数，数组
      var ids = this.handleSelectRow()
      if (!ids) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }

      axios
        .request({
          url: 'admin/schedule/resume',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    // 立即执行
    run (row) {
      this.btn_loading = true
      if (!row.id) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }
      //参数，数组
      var ids = [row.id]

      axios
        .request({
          url: 'admin/schedule/run',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    // 批量执行
    batchRun () {
      this.btn_loading = true
      //参数，数组
      var ids = this.handleSelectRow()
      if (!ids) {
        this.$Message.error('选项不能为空')
        this.btn_loading = false
        return
      }

      axios
        .request({
          url: 'admin/schedule/run',
          method: 'post',
          data: ids
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      this.btn_loading = false
    },
    maxSlice (v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + "..." : v
      }
    },

  },
  mounted () {
    this.loadTableData()
  }
}
</script>

<style>
</style>