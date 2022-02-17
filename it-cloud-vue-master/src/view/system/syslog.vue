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
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </div>
      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getSyslogTableData } from '@/api/system'
import axios from '@/libs/api.request'

export default {
  name: 'syslog_table_page',
  components: {
    Tables
  },
  data () {
    return {
      tableLoading: true,
      btn_loading: false,
      updateForm: {},
      tableData: [],
      searchValue: '',
      searchKey: 'username',
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      searchColumns: [
        { title: '用户', key: 'username' },
        { title: '操作', key: 'operation' }
      ],
      columns: [
        {
          title: '序号',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + (this.page - 1) * this.pageSize + 1)
          }
        },
        { title: '用户', key: 'username', width: 80, },
        { title: '操作', key: 'operation' },
        {
          title: '请求方法',
          key: 'method',
          width: 200,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
                this.maxSlice(params.row.method),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.method)
              ])
          }
        },
        {
          title: '参数',
          key: 'method',
          width: 200,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
                this.maxSlice(params.row.params),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.params)
              ])
          }
        },
        { title: '执行时长(ms)', key: 'time' },
        { title: 'IP', key: 'ip' },
        { title: '创建时间', key: 'createTime' }
      ],

    }
  },
  methods: {
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
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

      // 动态设置参数
      let key = this.searchKey
      this.$set(params, key, this.searchValue)

      getSyslogTableData(params).then(res => {
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
    refresh () {
      this.loadTableData()
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