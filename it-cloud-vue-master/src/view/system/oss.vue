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
          <Icon type="search" />上传文件
        </Button>
        <Button @click="batchDelete" class="search-btn" type="error" :loading="btn_loading">
          <Icon type="search" />批量删除
        </Button>
      </div>
      <Table
        stripe
        ref="tables"
        :data="tableData"
        :columns="columns"
        @on-select="handleSelectRow()"
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

    <!-- 添加MODAL -->
    <Modal v-model="insert_modal" title="添加" @on-cancel="cancel">
      <div>
        <Upload
          multiple
          type="drag"
          :action="action_url"
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
import { getOssData } from '@/api/system'
import axios from '@/libs/api.request'
import store from '@/store'

export default {
  name: 'oss_table_page',
  components: {
    Tables
  },
  data () {
    return {
      action_url: this.$config.itcloudUrl + '/admin/oss/upload?Authorization=' + store.state.user.token,
      uploadId: '',
      btn_loading: false,
      selectIds: [],
      insert_modal: false,
      delete_id: '',
      delete_modal: false,
      modal_loading: false,
      tableData: [],
      searchValue: '',
      searchKey: 'name',
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      searchColumns: [
        { title: '名称', key: 'name' }
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
        {
          title: '名称',
          key: 'name'
        },
        {
          title: 'URL',
          key: 'method',
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
                this.maxSlice(params.row.url),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.url)
              ])
          }
        },
        { title: '创建时间', key: 'createTime' },
        {
          title: '操作',
          key: 'handle',
          width: 150,
          render: (h, params) => {
            return h('div', [
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
    handleClear (e) {
      if (e.target.value === '') this.insideTableData = this.value
    },
    loadTableData () {
      let params = {
        page: this.page,
        limit: this.pageSize
      }
      let key = this.searchKey
      // 动态设置参数
      this.$set(params, key, this.searchValue)

      getOssData(params).then(res => {
        if (res.data.success) {
          this.tableData = res.data.data.list
          this.total = res.data.data.totalCount
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    cancel () {
      this.insert_modal = false
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
      this.modal_loading = true
      if (!this.delete_id) {
        this.$Message.success('删除ID不能为空')
        return
      }
      //参数，数组
      var ids = [this.delete_id]

      axios
        .request({
          url: 'admin/oss/delete',
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
          url: 'admin/oss/delete',
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
    // 多选
    handleSelectRow () {
      let ids = [];
      this.$refs['tables'].getSelection().map(item => {
        ids.push(item.id)
      })
      console.log(ids)
      return ids
    },
    maxSlice (v) {
      if (v) {
        return v.length > 100 ? v.slice(0, 100) + "..." : v
      }
    },
    uploadSuccess (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      console.log(res)
      if (res.success) {
        this.$Message.success('上传成功 ')
        this.delete_id = res.data
        this.refresh()
      } else {
        this.$Message.success(res.msg)
      }
      // console.log(res)
      // console.log(file)
      // console.log(fileList)
    },
    uploadError (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      this.$Message.error('上传失败：' + res.msg)
      console.log(res)
    },
    uploadRemove (res, file, fileList) { // 文件上传回调 上传成功后删除待上传文件
      this.$Message.error('移除成功')
      console.log(res)
      console.log(file)
      console.log(fileList)
    },

  },
  mounted () {
    this.loadTableData()
  }
}
</script>

<style>
</style>