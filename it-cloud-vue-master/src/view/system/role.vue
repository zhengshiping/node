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
          <FormItem label="角色名" prop="username">
            <Input type="text" v-model="updateForm.roleName" />
          </FormItem>
          <FormItem label="备注" prop="password">
            <Input type="text" v-model="updateForm.remark" />
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
          <FormItem label="角色名" prop="username">
            <Input type="text" v-model="insertForm.roleName" />
          </FormItem>
          <FormItem label="备注" prop="password">
            <Input type="text" v-model="insertForm.remark" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="insert">确认</Button>
      </div>
    </Modal>

    <!-- 权限配置MODAL -->
    <Modal v-model="allot_modal" title="权限配置" @on-cancel="cancel">
      <div>
        <input type="hidden" v-model="allot_role_id" />
        <Form ref="allotForm" :label-width="80" label-position="top">
          <FormItem label="权限列表" prop="menuList">
            <Tree :data="menuList" show-checkbox ref="menuTree"></Tree>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="allotMenu">确认</Button>
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
import { getRoleTableData, getMenuSelectTableData, getMenuListDataByRole } from '@/api/auth'
import axios from '@/libs/api.request'
import { treeDataTranslate, buildTree } from '@/libs/util'

export default {
  name: 'role_table_page',
  components: {
    Tables
  },
  data () {
    // 校验规则器
    const validateRoleName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('roleName cannot be empty'))
      } else {
        callback()
      }
    }

    return {
      tableLoading: true,
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
      searchValue: '',
      searchKey: 'roleName',
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      update_modal: false,
      ruleUpdateForm: {
        roleName: [{ validator: validateRoleName, trigger: 'blur' }],
        remark: [
          {
            required: true,
            message: 'Please input the remark',
            trigger: 'blur'
          }
        ]
      },
      ruleInsertForm: {
        roleName: [{ validator: validateRoleName, trigger: 'blur' }],
        remark: [
          {
            required: true,
            message: 'Please input the remark',
            trigger: 'blur'
          }
        ]
      },
      searchColumns: [{ title: '角色名', key: 'roleName' }],
      columns: [
        { title: '角色名', key: 'roleName', sortable: true },
        { title: '备注', key: 'remark', sortable: true },
        { title: '创建时间', key: 'createTime' },
        {
          title: '操作',
          key: 'handle',
          width: 220,
          button: [
            (h, params, vm) => {
              return h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showMenu(params.row)
                    }
                  }
                },
                '权限配置'
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
                      this.show(params.row)
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

    }
  },
  mounted () {
    this.loadTableData()
  },
  methods: {
    handleDelete (params) {
      this.delete_modal = true
      this.delete_id = params.row.id
      console.log(this.delete_id)
    },
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
      })
    },
    show (row) {
      this.updateForm = row
      this.update_modal = true
    },
    showMenu (row) {
      this.roleMenuList = []

      // 角色菜单
      let params = {
        roleId: row.id
      }
      getMenuListDataByRole(params).then(res => {
        if (res.data.success) {
          this.roleMenuData = res.data.data
          // 所有菜单
          getMenuSelectTableData().then(res => {
            if (res.data.success) {
              // 设置修改添加Tree
              this.menuList = buildTree(res.data.data, this.roleMenuData)
            } else {
              this.$Message.error(res.data.msg)
            }
          })
        } else {
          this.$Message.error(res.data.msg)
        }
      })

      // 重置roleMenuData
      this.roleMenuData = []
      this.allot_role_id = row.id
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

      getRoleTableData(params).then(res => {
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

      getRoleTableData(params).then(res => {
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
              url: 'admin/role',
              method: 'put',
              data: {
                id: this.updateForm.id,
                roleName: this.updateForm.roleName,
                remark: this.updateForm.remark
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
    /**
     *分配权限 
     */
    allotMenu () {
      this.modal_loading = true
      // 获取选中值
      let checkedMenuList = this.$refs.menuTree.getCheckedAndIndeterminateNodes()
      let menuIdList = []
      for (let n = 0; n < checkedMenuList.length; n++) {
        menuIdList.push(checkedMenuList[n].id)
      }

      axios
        .request({
          url: 'admin/roleMenu/allot',
          method: 'post',
          data: {
            roleId: this.allot_role_id,
            menuList: menuIdList
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

      this.allot_role_id = ''
      this.allot_modal = false
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
          url: 'admin/role/delete',
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

      this.modal_loading = false;
      this.delete_modal = false;
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
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/role',
              method: 'post',
              data: {
                roleName: this.insertForm.roleName,
                remark: this.insertForm.remark
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

  }
}
</script>

<style>
</style>
