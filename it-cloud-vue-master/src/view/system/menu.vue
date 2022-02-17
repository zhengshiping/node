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
      <!-- 表单 -->
      <tree-table
        expand-key="name"
        :expand-type="false"
        :show-index="true"
        stripe
        :is-fold="true"
        :selectable="false"
        :columns="columns"
        :loading="tableLoading"
        :data="tableData"
      >
        <template slot="icon" slot-scope="{row}">
          <Icon :type="row.icon" size="20" />
        </template>
        <template slot="type" slot-scope="{row}">
          <Button v-if="row.type === 0" size="small">目录</Button>
          <Button v-else-if="row.type === 1" size="small" type="success">菜单</Button>
          <Button v-else-if="row.type === 2" size="small" type="info">按钮</Button>
        </template>
        <template slot="perms" slot-scope="{row}">
          <Tooltip :content="row.perms" placement="top" max-width="300px">
            <p>{{maxSlice(row.perms)}}</p>
          </Tooltip>
        </template>
        <template slot="operate" slot-scope="{row}">
          <Button @click="show(row)" type="primary" size="small" style="margin-right: 5px">修改</Button>
          <Button @click="handleDelete(row)" type="error" size="small">删除</Button>
        </template>
      </tree-table>

      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
    <!-- 更新MODAL -->
    <Modal v-model="update_modal" title="修改" @on-cancel="cancel">
      <div>
        <Form ref="updateForm" :model="updateForm" :rules="ruleUpdateForm" :label-width="80">
          <FormItem label="类型" prop="type">
            <RadioGroup v-model="updateForm.type" @on-change="typeChange">
              <Radio :label="0">目录</Radio>
              <Radio :label="1">菜单</Radio>
              <Radio :label="2">按钮</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="名称" prop="name">
            <Input type="text" v-model="updateForm.name" />
          </FormItem>
          <FormItem label="上级菜单" prop="parentId">
            <tree-select
              v-model="treeSelected"
              style="width: 300px;"
              check-strictly
              :expand-all="true"
              :data="treeData"
            ></tree-select>
          </FormItem>
          <FormItem label="菜单路由" prop="url" v-show="urlShow">
            <Input type="text" v-model="updateForm.url" />
          </FormItem>
          <FormItem label="授权标识" prop="perms" v-show="permsShow">
            <Input type="text" v-model="updateForm.perms" />
          </FormItem>
          <FormItem label="菜单图标" prop="icon" v-show="iconShow">
            <Input type="text" v-model="updateForm.icon" />
          </FormItem>
          <FormItem label="排序" prop="orderNum" v-show="orderNumShow">
            <Input type="text" v-model="updateForm.orderNum" />
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
          <FormItem label="类型" prop="type">
            <RadioGroup v-model="insertForm.type" @on-change="insertTypeChange">
              <Radio :label="0">目录</Radio>
              <Radio :label="1">菜单</Radio>
              <Radio :label="2">按钮</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="名称" prop="name">
            <Input type="text" v-model="insertForm.name" />
          </FormItem>
          <FormItem label="上级菜单" prop="parentId">
            <tree-select
              v-model="insertTreeSelected"
              style="width: 300px;"
              check-strictly
              :expand-all="true"
              :data="treeData"
            ></tree-select>
          </FormItem>
          <FormItem label="菜单路由" prop="url" v-show="urlShow">
            <Input type="text" v-model="insertForm.url" />
          </FormItem>
          <FormItem label="授权标识" prop="perms" v-show="permsShow">
            <Input type="text" v-model="insertForm.perms" />
          </FormItem>
          <FormItem label="菜单图标" prop="icon" v-show="iconShow">
            <Input type="text" v-model="insertForm.icon" />
          </FormItem>
          <FormItem label="排序" prop="orderNum" v-show="orderNumShow">
            <Input type="text" v-model="insertForm.orderNum" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="insert">确认</Button>
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
import { getMenuTableData, getMenuSelectTableData } from '@/api/auth'
import axios from '@/libs/api.request'
import { treeDataTranslate, buildSelectTree } from '@/libs/util'
import TreeSelect from '_c/tree-select'

export default {
  name: 'menu_table_page',
  components: {
    Tables,
    TreeSelect
  },

  data () {
    // 校验规则器
    const validateName = (rule, value, callback) => {
      if (!value) {
        // todo: 菜单判断重复
        callback(new Error('name cannot be empty'))
      } else {
        callback()
      }
    }

    return {
      tableLoading: true,
      insertTreeSelected: [],
      treeSelected: [],
      treeData: [],
      urlShow: false,
      permsShow: false,
      iconShow: false,
      orderNumShow: false,
      insertForm: {},
      insert_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      updateForm: {},
      searchValue: '',
      searchKey: 'name',
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      update_modal: false,
      ruleUpdateForm: {
        name: [{ validator: validateName, trigger: 'blur' }]

      },
      ruleInsertForm: {
        name: [{ validator: validateName, trigger: 'blur' }],
        // type: [
        //   { required: true, message: 'Please select type', trigger: 'change' }
        // ],
      },
      searchColumns: [{ title: '菜单名', key: 'name' }],
      columns: [
        { title: '名称', key: 'name' },
        { title: '上级菜单', key: 'parentName' },
        {
          title: '图标',
          key: 'icon',
          width: '50px',
          type: 'template',
          template: 'icon'
        },
        {
          title: '类型',
          key: 'type',
          type: 'template',
          template: 'type'
        },
        { title: '菜单URL', key: 'url', minWidth: '100px', },
        {
          title: '授权标识',
          key: 'perms',
          minWidth: '100px',
          type: 'template',
          template: 'perms'
        },
        { title: '排序', key: 'orderNum', width: '50px' },
        {
          title: '操作',
          key: 'operate',
          type: 'template',
          template: 'operate'
        }
      ],
      tableData: [],
      data: []
    }
  },
  mounted () {
    this.loadTableData()
    //加载上级目录tree
    this.loadParentTreeData()
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
    show (row) {
      this.updateForm = row
      this.typeChange()
      this.treeSelected = [row.parentId]
      this.update_modal = true

    },
    // 搜索
    handleSearch () {
      this.tableLoading = true

      let key = this.searchKey
      let params = {
      }
      // 动态设置参数
      this.$set(params, key, this.searchValue)

      getMenuTableData(params).then(res => {
        if (res.data.success) {
          this.tableData = treeDataTranslate(res.data.data)
          this.tableLoading = false
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
      
      getMenuTableData().then(res => {
        if (res.data.success) {
          this.tableData = treeDataTranslate(res.data.data)
          this.tableLoading = false
          // 设置修改添加下拉框
          // this.treeData = buildTree(res.data.data)
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    loadParentTreeData () {
      getMenuSelectTableData().then(res => {
        if (res.data.success) {
          // 设置修改添加下拉框
          this.treeData = buildSelectTree(res.data.data)
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    update () {
      this.modal_loading = true
      if (this.treeSelected.length > 1) {
        this.$Modal.warning({
          title: '警告',
          content: `上级菜单不能有多个`
        })
        this.modal_loading = false
        return
      }
      if (this.updateForm.type !== 0 && this.treeSelected.length === 0) {
        this.$Modal.warning({
          title: '警告',
          content: `菜单和按钮必须存在上级`
        })
        this.modal_loading = false
        return
      }

      let _parentId = ""
      if (this.treeSelected.length > 0) {
        _parentId = this.treeSelected[0]
      } else if (this.updateForm.type === 0) {
        _parentId = "0"
      }
      this.$refs['updateForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/menu',
              method: 'put',
              data: {
                id: this.updateForm.id,
                parentId: _parentId,
                name: this.updateForm.name,
                url: this.updateForm.url,
                perms: this.updateForm.perms,
                type: this.updateForm.type,
                icon: this.updateForm.icon,
                orderNum: this.updateForm.orderNum
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
          url: 'admin/menu/' + this.delete_id,
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

      this.modal_loading = false;
      this.delete_modal = false;
      // setTimeout(() => {
      //   this.modal_loading = false;
      //   this.delete_modal = false;
      //   this.$Message.success('删除成功');
      // }, 2000);
    },
    refresh () {
      this.loadTableData()
      //加载上级目录tree
      this.loadParentTreeData()
    },
    showInsert () {
      this.insert_modal = true
    },
    // 添加
    insert () {
      this.modal_loading = true

      if (this.insertTreeSelected.length > 1) {
        this.$Modal.warning({
          title: '警告',
          content: `上级菜单不能有多个`
        })
        this.modal_loading = false
        return
      }
      if (this.insertForm.type !== 0 && this.insertTreeSelected.length === 0) {
        this.$Modal.warning({
          title: '警告',
          content: `菜单和按钮必须存在上级`
        })
        this.modal_loading = false
        return
      }

      let _parentId = ""
      if (this.insertTreeSelected.length > 0) {
        _parentId = this.insertTreeSelected[0]
      } else if (this.insertForm.type === 0) {
        _parentId = "0"
      }

      this.$refs['insertForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'admin/menu',
              method: 'post',
              data: {
                parentId: _parentId,
                name: this.insertForm.name,
                url: this.insertForm.url,
                perms: this.insertForm.perms,
                type: this.insertForm.type,
                icon: this.insertForm.icon,
                orderNum: this.insertForm.orderNum
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
    maxSlice (v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + "..." : v
      }
    },
    typeChange () {
      this.urlShow = false
      this.permsShow = false
      this.iconShow = false
      this.orderNumShow = false

      if (this.updateForm.type == 0) {
        this.iconShow = true
        this.orderNumShow = true
      } else if (this.updateForm.type == 1) {
        this.urlShow = true
        this.permsShow = true
        this.iconShow = true
        this.orderNumShow = true
      } else {
        this.permsShow = true
      }
    },
    insertTypeChange () {
      this.urlShow = false
      this.permsShow = false
      this.iconShow = false
      this.orderNumShow = false

      if (this.insertForm.type == 0) {
        this.iconShow = true
        this.orderNumShow = true
      } else if (this.insertForm.type == 1) {
        this.urlShow = true
        this.permsShow = true
        this.iconShow = true
        this.orderNumShow = true
      } else {
        this.permsShow = true
      }
    },
    handleTreeSelectClick (selectArray, item) {
      // console.log(selectArray, item);
    },


  }
}
</script>

<style>
</style>
