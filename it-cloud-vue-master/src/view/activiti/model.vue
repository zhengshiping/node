<template>
  <div>
    <Card>
      <div>
        <!-- 搜索 -->
        <Form ref="formInline" :model="searchForm" inline :label-width="60">
          <FormItem prop="name" label="名称">
            <Input
              @on-change="handleClear"
              clearable
              placeholder="输入关键字搜索"
              class="search-input"
              v-model="searchName"
            />
          </FormItem>
          <FormItem prop="key" label="标识key">
            <Input
              @on-change="handleClear"
              clearable
              placeholder="输入关键字搜索"
              class="search-input"
              v-model="searchKey"
            />
          </FormItem>

          <Button @click="handleSearch" class="search-btn" type="primary">
            <Icon type="ios-search" />搜索
          </Button>&nbsp;
          <Button @click="showInsert" class="search-btn" type="info">
            <Icon type="ios-add" />添加模型
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
    <Modal v-model="insert_modal" title="添加" @on-cancel="cancel">
      <div>
        <Form ref="insertForm" :model="insertForm" :rules="modelInsertForm" :label-width="80">
          <FormItem label="名称" prop="name">
            <Input type="text" v-model="insertForm.name" />
          </FormItem>
          <FormItem label="标识KEY" prop="key">
            <Input type="text" v-model="insertForm.key" />
          </FormItem>
          <FormItem label="备注" prop="description">
            <Input type="text" v-model="insertForm.description" />
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
        <p>你确定要删除？</p>
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
import { getModelTableData, exportModel } from '@/api/activiti'
import axios from '@/libs/api.request'
import { treeDataTranslate, buildTree } from '@/libs/util'

export default {
  name: 'model_table_page',
  components: {
    Tables
  },
  data () {
    // 校验规则器
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('name cannot be empty'))
      } else {
        callback()
      }
    }

    return {
      tableLoading: true,
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
      ruleUpdateForm: {
        name: [{ validator: validateName, trigger: 'blur' }],
        key: [
          {
            required: true,
            message: 'Please input the key',
            trigger: 'blur'
          }
        ]
      },
      modelInsertForm: {
        name: [{ validator: validateName, trigger: 'blur' }],
        key: [
          {
            required: true,
            message: 'Please input the key',
            trigger: 'blur'
          }
        ]
      },
      searchColumns: [{ title: '角色名', key: 'roleName' }],
      columns: [
        { title: '名称', key: 'name' },
        { title: '标识', key: 'key' },
        // { title: '描述', key: 'name' },
        { title: '版本', key: 'version', width: 70 },
        {
          title: '创建时间',
          key: 'createTime',
          render: (h, params) => {
            const row = params.row;
            return h('div', [
              h('span', {}, this.dateFormat(row.createTime)),
            ]);
          }
        },
        {
          title: '更新时间',
          key: 'lastUpdateTime',
          render: (h, params) => {
            const row = params.row;
            return h('div', [
              h('span', {}, this.dateFormat(row.lastUpdateTime)),
            ]);
          }
        },
        {
          title: '操作',
          key: 'handle',
          fixed: 'right',
          width: 300,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.showDesign(params.row)
                  }
                }
              }, '在线设计'),
              h('Button', {
                props: {
                  type: 'info',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.showDeploy(params.row)
                  }
                }
              }, '部署发布'),
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.export(params.row)
                  }
                }
              }, '导出XML'),
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
              }, '删除')
            ]);
          }
        }
      ],
      tableData: [],

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
    show (row) {
      this.updateForm = row
      this.update_modal = true
    },
    // 搜索
    handleSearch () {
      this.tableLoading = true
      
      let name = this.searchName
      let key = this.searchKey
      let params = {
        page: this.page,
        limit: this.pageSize,
        name: name,
        key: key
      }
      // 动态设置参数
      // this.$set(params, key, this.searchValue)

      getModelTableData(params).then(res => {
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

      getModelTableData(params).then(res => {
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
      //参数，数组
      var ids = [this.delete_id]

      axios
        .request({
          url: 'act/model/delete',
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
    showDesign (row) {
      this.modelerUrl = this.$config.itcloudUrl + '/modeler.html?modelId=' + row.id
      this.design_modal = true
    },
    // 添加
    insert () {
      this.modal_loading = true
      this.$refs['insertForm'].validate(valid => {
        this.modal_loading = false
        if (valid) {
          axios
            .request({
              url: 'act/model',
              method: 'post',
              data: {
                name: this.insertForm.name,
                key: this.insertForm.key,
                description: this.insertForm.description
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
    dateFormat (time) {
      var date = new Date(time);
      var year = date.getFullYear();
      /* 在日期格式中，月份是从0开始的，因此要加0
       * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
       * */
      var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      // 拼接
      return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    modelCancel () {
      // this.$Message.info('Clicked cancel');
      this.$Modal.info({
        title: "提示",
        content: "请确认点击了左上角的保存按钮"
      });
    },
    export (row) {
      // window.location.href = url; // 本窗口打开下载
      // window.open('act/model/export?id='+row.id, '_blank'); // 新开窗口下载
      axios
        .request({
          url: 'act/model/export',
          method: 'get',
          responseType: 'blob',    // 设置响应数据类型
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
      let data = res.data;
      if (!data) {
        return;
      }
      const fileName = '模型.xml'
      const blob = new Blob([data])
      if (window.navigator.msSaveOrOpenBlob) {// 兼容IE10
        navigator.msSaveBlob(blob, fileName);
      } else {// 其他非IE内核支持H5的浏览器
        let url = window.URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click()
      }
    },
    showDeploy (row) {
      this.$Modal.confirm({
        title: "提示",
        content: "请确认点击了左上角的保存按钮",
        okText: "确定",
        cancelText: "取消",
        loading: true,
        onOk () {
          axios
            .request({
              url: 'act/model/deploy',
              method: 'get',
              params: {
                id: row.id
              }
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
    },

  }
}
</script>

<style>
</style>
