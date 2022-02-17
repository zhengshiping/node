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
        <Button @click="handleSearch" class="search-btn" type="primary">
          <Icon type="search" />搜索
        </Button>
        <Button @click="showInsert" class="search-btn" type="success">
          <Icon type="search" />添加
        </Button>
      </div>
      <tables
        ref="tables"
        editable
        searchable
        search-place="top"
        v-model="tableData"
        :columns="columns"
        :loading="tableLoading"
        @on-delete="handleDelete"
      />
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
    <!-- 更新MODAL -->
    <Modal v-model="update_modal" title="修改" @on-cancel="cancel">
      <div>
        <Form ref="updateForm" :model="updateForm" :rules="ruleUpdateForm" :label-width="80">
          <FormItem label="用户名" prop="username">
            <Input type="text" v-model="updateForm.username" />
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input type="password" v-model="updateForm.password" />
          </FormItem>
          <FormItem label="年龄" prop="age">
            <Input type="text" v-model="updateForm.age" number />
          </FormItem>
          <FormItem label="性别" prop="sex">
            <RadioGroup v-model="updateForm.sex">
              <Radio label="male">男</Radio>
              <Radio label="female">女</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="邮箱" prop="email">
            <Input v-model="updateForm.email" placeholder="Enter your e-mail" />
          </FormItem>
          <FormItem label="手机号" prop="mobile">
            <Input type="text" v-model="updateForm.mobile" />
          </FormItem>
          <FormItem label="状态" prop="status">
            <RadioGroup v-model="updateForm.status">
              <Radio :label="0">正常</Radio>
              <Radio :label="1">锁定</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="ok">确认</Button>
      </div>
    </Modal>

    <!-- 添加MODAL -->
    <Modal v-model="insert_modal" title="添加" @on-cancel="cancel">
      <div>
        <Form ref="insertForm" :model="insertForm" :rules="ruleInsertForm" :label-width="80">
          <FormItem label="用户名" prop="username">
            <Input type="text" v-model="insertForm.username" />
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input type="password" v-model="insertForm.password" />
          </FormItem>
          <FormItem label="年龄" prop="age">
            <Input type="text" v-model="insertForm.age" number />
          </FormItem>
          <FormItem label="性别" prop="sex">
            <RadioGroup v-model="insertForm.sex">
              <Radio label="male">男</Radio>
              <Radio label="female">女</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="邮箱" prop="email">
            <Input v-model="insertForm.email" placeholder="Enter your e-mail" />
          </FormItem>
          <FormItem label="手机号" prop="mobile">
            <Input type="text" v-model="insertForm.mobile" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="insertUser">确认</Button>
      </div>
    </Modal>

    <!-- 分配角色MODAL -->
    <Modal v-model="allot_modal" title="分配角色" @on-cancel="cancel">
      <div>
        <Form ref="updateRoleForm" label-position="top">
          <input type="hidden" v-model="allot_user_id" />
          <FormItem label="角色" prop="role">
            <CheckboxGroup v-model="userRoleList">
              <Checkbox v-for="role in roleList" :label="role.id" :key="role.id">
                <span>{{role.remark}}</span>
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="allotRole">确认</Button>
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
import { getUserTableData, getRoleListData, getRoleListDataByUser } from '@/api/auth'
import axios from '@/libs/api.request'

export default {
  name: 'user_table_page',
  components: {
    Tables
  },
  data () {
    // 校验规则器
    const validateUsername = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('username cannot be empty'))
      } else {
        callback()
      }
    }

    const validateAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('age cannot be empty'))
      }
      // 模拟异步验证效果
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('Please enter a numeric value'))
        } else {
          if (value < 16) {
            callback(new Error('Must be over 16 years of age'))
          } else {
            callback()
          }
        }
      }, 1000)
    }
    return {
      tableLoading: true,
      allot_user_id: '',
      roleList: [],
      allot_modal: false,
      userRoleList: [],
      insertForm: {},
      insert_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      updateForm: {},
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      update_modal: false,
      ruleUpdateForm: {
        username: [{ validator: validateUsername, trigger: 'blur' }],
        age: [{ validator: validateAge, trigger: 'blur' }],
        email: [
          {
            required: true,
            message: 'Mailbox cannot be empty',
            trigger: 'blur'
          },
          { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
        ],
        sex: [
          {
            required: true,
            message: 'Please select the sex',
            trigger: 'change'
          }
        ]
      },
      ruleInsertForm: {
        username: [
          { validator: validateUsername, trigger: 'blur' }
        ],
        age: [{ validator: validateAge, trigger: 'blur' }],
        email: [
          {
            required: true,
            message: 'Mailbox cannot be empty',
            trigger: 'blur'
          },
          { type: 'email', message: 'Incorrect email format', trigger: 'blur' }
        ],
        sex: [
          {
            required: true,
            message: 'Please select the sex',
            trigger: 'change'
          }
        ]
      },
      searchColumns: [
        { title: '名称', key: 'username' },
        { title: '手机号', key: 'mobile' }
      ],
      columns: [
        { title: '名称', key: 'username', sortable: true },
        { title: '性别', key: 'sex', sortable: true },
        { title: '邮箱', key: 'email', editable: true },
        { title: '手机号', key: 'mobile', editable: true },
        { title: '创建时间', key: 'createTime' },
        {
          title: '操作',
          key: 'handle',
          // options: ['delete'],
          width: 220,
          button: [
            (h, params, vm) => {
              return h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showAllotRole(params.row)
                    }
                  }
                },
                '分配角色'
              )
            },
            (h, params, vm) => {
              return h(
                'Button',
                {
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
                },
                '修改'
              )
            },
            (h, params, vm) => {
              return h(
                'Poptip',
                {
                  props: {
                    confirm: true,
                    title: '你确定要删除吗?'
                  },
                  on: {
                    'on-ok': () => {
                      vm.$emit('on-delete', params)
                    }
                  }
                },
                [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'error',
                        size: 'small'
                      },
                      style: {
                        marginRight: '5px'
                      },
                      on: {
                        click: () => {
                          //什么也不做，交给Poptip做
                        }
                      }
                    },
                    'Delete'
                  )
                ]
              )
            }
          ]
        }
      ],
      tableData: [],
      searchValue: '',
      searchKey: 'username'
    }
  },
  methods: {
    handleDelete (params) {
      this.delete_modal = true
      this.delete_id = params.row.id
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
    showAllotRole (row) {
      // 所有角色
      getRoleListData().then(res => {
        if (res.data.success) {
          this.roleList = res.data.data
        } else {
          this.$Message.error(res.data.msg)
        }
      })

      // 用户角色
      let params = {
        userId: row.id
      }
      getRoleListDataByUser(params).then(res => {
        if (res.data.success) {
          let data = res.data.data
          if (data) {
            let idList = []
            for (let i = 0; i < data.length; i++) {
              idList.push(data[i].id)
            }
            this.userRoleList = idList
          } else {
            this.userRoleList = []
          }
        } else {
          this.$Message.error(res.data.msg)
        }
      })

      this.allot_user_id = row.id
      this.allot_modal = true
    },

    // 搜索
    handleSearch () {
      this.tableLoading = true

      let key = this.searchKey
      let params = {
        page: this.page,
        limit: this.pageSize
      }
      // 动态设置参数
      this.$set(params, key, this.searchValue)

      getUserTableData(params).then(res => {
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

      getUserTableData(params).then(res => {
        if (res.data.success) {
          this.tableLoading = false
          this.tableData = res.data.data.list
          this.total = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    ok () {
      this.modal_loading = true
      this.$refs['updateForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/user',
              method: 'put',
              data: {
                id: this.updateForm.id,
                username: this.updateForm.username,
                password: this.updateForm.password,
                age: this.updateForm.age,
                sex: this.updateForm.sex,
                email: this.updateForm.email,
                mobile: this.updateForm.mobile,
                status: this.updateForm.status
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
          this.update_modal = false
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
          url: 'admin/user/' + this.delete_id,
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
    insertUser () {
      this.modal_loading = true
      this.$refs['insertForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/user',
              method: 'post',
              data: {
                username: this.insertForm.username,
                password: this.insertForm.password,
                age: this.insertForm.age,
                sex: this.insertForm.sex,
                email: this.insertForm.email,
                mobile: this.insertForm.mobile
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
        } else {
          this.$Message.error('Fail!')
          return
        }
      })
    },
    allotRole () {
      this.modal_loading = true
      axios
        .request({
          url: 'admin/userRole/allot',
          method: 'post',
          data: {
            userId: this.allot_user_id,
            roleList: this.userRoleList
          }
        })
        .then(res => {
          this.modal_loading = false
          if (res.data.success) {
            this.$Message.success('操作成功')
            this.refresh()
          } else {
            this.$Message.error(res.data.msg)
          }
        })

      this.allot_user_id = ''
      this.allot_modal = false
    }

  },
  mounted () {
    this.loadTableData()
  }
}
</script>

<style>
</style>
