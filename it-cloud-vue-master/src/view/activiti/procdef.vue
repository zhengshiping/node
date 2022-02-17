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
          <Button @click="showFileModal" class="search-btn" type="info">
            <Icon type="md-cloud-upload" />部署流程文件
          </Button>&nbsp;
          <Button @click="batchDelete" class="search-btn" type="error">
            <Icon type="ios-trash" />批量删除
          </Button>
        </Form>
      </div>
      <!-- 列表 -->
      <Table ref="tables" border stripe :columns="columns" :data="tableData" :loading="tableLoading"></Table>
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
    <!-- 图片MODAL -->
    <Modal v-model="img_modal" draggable title="流程设计" width="800" height="800">
      <div>
        <img :src="imageUrl" style="height: 100%;width: 100%;" />
      </div>
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

    <!-- 删除提示MODAL -->
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

    <!-- 提示MODAL -->
    <Modal v-model="pause_modal" title="提示" width="300" @on-cancel="cancel">
      <p>你确认要挂起流程？</p>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="pause">确认</Button>
      </div>
    </Modal>
    <!-- 提示MODAL -->
    <Modal v-model="resume_modal" title="提示" width="300" @on-cancel="cancel">
      <p>你确认要激活流程？</p>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" :loading="modal_loading" @click="resume">确认</Button>
      </div>
    </Modal>
    <!-- 上传流程文件MODAL -->
    <Modal v-model="file_modal" title="添加" @on-cancel="cancel">
      <div>
        <Upload
          multiple
          type="drag"
          :action= "action"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :on-remove="uploadRemove"
        >
          <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Click or drag files here to upload</p>
          </div>
        </Upload>
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getProcdefTableData } from '@/api/activiti'
import axios from '@/libs/api.request'
import { treeDataTranslate, buildTree } from '@/libs/util'
import store from '@/store'

export default {
  name: 'procdef_table_page',
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
      action: this.$config.itcloudUrl + "/act/procdef/deploy",
      tableLoading: true,
      file_modal: false,
      status_id: '',
      pause_modal: false,
      resume_modal: false,
      infoMsg: '',
      img_modal: false,
      imageUrl: '',
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
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        { title: '部署ID', key: 'deploymentId', width: 100 },
        { title: '名称', key: 'name', width: 120 },
        { title: '标识', key: 'key', width: 70 },
        {
          title: '描述',
          key: 'description',
          width: 150,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
                this.maxSlice(params.row.description),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.description)
              ])
          }
        },
        { title: '版本', key: 'version', width: 70 },
        {
          title: '状态',
          key: 'suspensionState',
          width: 70,
          align: 'center',
          render: (h, params) => {
            let status = ''
            if (params.row.suspensionState == 1) {
              status = '运行'
            } else if (params.row.suspensionState == 2) {
              status = '暂停'
            } else {
              status = '未知'
            }
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: params.row.suspensionState == 1 ? "success" : params.row.suspensionState == 2 ?
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
        { title: '部署时间', key: 'deployTime', width: 150 },
        {
          title: '流程图片',
          key: 'dgrmResourceName',
          width: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  props: {
                    type: "ios-book-outline",
                    size: "large"
                  },
                  style: {
                    marginRight: "5px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.showImage(params.row.id);
                    }
                  }
                }, params.row.dgrmResourceName
              )
            ])
          }
        },
        { title: '流程XML', key: 'resourceName', width: 150 },
        {
          title: '操作',
          key: 'handle',
          fixed: 'right',
          width: 200,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (params.row.suspensionState != 1) ? "none" : "inline-block",
                },
                on: {
                  click: () => {
                    this.showPause(params.row)
                  }
                }
              }, '挂起'),
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small',
                },
                style: {
                  marginRight: '5px',
                  display: (params.row.suspensionState == 1) ? "none" : "inline-block",
                },
                on: {
                  click: () => {
                    this.showResume(params.row)
                  }
                }
              }, '激活'),
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.convertToModel(params.row)
                  }
                }
              }, '转模型'),
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
      this.delete_id = row.deploymentId
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
    refresh () {
      this.loadTableData()
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

      getProcdefTableData(params).then(res => {
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

      getProcdefTableData(params).then(res => {
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
      this.pause_modal = false
      this.resume_modal = false
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
    // 多选
    handleSelectRow () {
      let ids = [];
      this.$refs['tables'].getSelection().map(item => {
        ids.push(item.deploymentId)
      })
      console.log(ids)
      return ids
    },
    // 批量删除确认
    batchDelete () {
      this.modal_loading = true
      //参数，数组
      var ids = this.handleSelectRow()
      if (!ids) {
        this.$Message.error('选项不能为空')
        this.modal_loading = false
        return
      }

      axios
        .request({
          url: 'act/procdef/delete',
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
          setTimeout(() => {
            this.modal_loading = false;
            this.delete_modal = false;
          }, 1000);
        })
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
          url: 'act/procdef/delete',
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
          setTimeout(() => {
            this.modal_loading = false;
            this.delete_modal = false;
          }, 1000);
        })
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
      console.log(res.headers)
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
            })
          //移除model
          this.$Modal.remove()
        }
      });
    },
    showPause (row) {
      this.pause_modal = true
      this.status_id = row.id
    },
    pause () {
      this.modal_loading = true
      axios
        .request({
          url: 'act/procdef/status',
          method: 'put',
          params: {
            id: this.status_id,
            state: 2
          }
        })
        .then(res => {
          if (res.data.success) {
            // 睡2s,等待activiti数据同步
            setTimeout(() => {
              this.$Message.success('操作成功')
              this.refresh()
              this.status_id = ''
              this.modal_loading = false
              this.pause_modal = false
            }, 5000)
          } else {
            this.status_id = ''
            this.modal_loading = false
            this.pause_modal = false
            this.$Message.error(res.data.msg)
          }

          // this.status_id = ''
          // this.modal_loading = false
          // this.pause_modal = false
        })
    },
    showResume (row) {
      this.resume_modal = true
      this.status_id = row.id
    },
    resume () {
      this.modal_loading = true
      axios
        .request({
          url: 'act/procdef/status',
          method: 'put',
          params: {
            id: this.status_id,
            state: 1
          }
        })
        .then(res => {
          if (res.data.success) {
            // 睡2s,等待activiti数据同步
            setTimeout(() => {
              this.$Message.success('操作成功')
              this.refresh()
              this.status_id = ''
              this.modal_loading = false
              this.resume_modal = false
            }, 5000)
          } else {
            this.status_id = ''
            this.modal_loading = false
            this.resume_modal = false
            this.$Message.error(res.data.msg)
          }

        })
    },
    // 分割字符串
    maxSlice (v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + "..." : v
      }
    },
    showImage (id) {
      this.img_modal = true
      var url = this.$config.itcloudUrl + "/act/procdef/read?id=" + id + "&type=image&Authorization=" + store.state.user.token
      this.imageUrl = url
    },
    // 转模型
    convertToModel (row) {
      this.$Modal.confirm({
        title: "提示",
        content: "请确认要转换模型",
        okText: "确定",
        cancelText: "取消",
        loading: true,
        onOk () {
          axios
            .request({
              url: 'act/procdef/convertToModel',
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
            })
          //移除model
          this.$Modal.remove()
        }
      });
    },
    showFileModal () {
      this.file_modal = true
    },
     uploadSuccess (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      if (res.success) {
        this.$Message.success('部署成功 ')
        this.refresh()
      } else {
        this.$Message.success(res.msg)
      }
    },
    uploadError (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      this.$Message.error('上传失败：' + res.msg)
      console.log(res)
    },
    uploadRemove (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      this.$Message.error('移除成功')
    },

  }
}
</script>

<style>
</style>
