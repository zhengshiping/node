<template>
  <div>
    <Card>
      <p slot="title">流程审批历史</p>
      <!-- 列表 -->
      <Table border stripe :columns="columns" :data="tableData"></Table>
    </Card>

    <Card style="margin-top: 10px">
      <p slot="title">实时流程图</p>
      <img :src="imageUrl" style="height: 100%;width: 100%;" />
    </Card>
  </div>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import Tables from '_c/tables'
import { getHistoryTaskTableData } from '@/api/activiti'
import axios from '@/libs/api.request'
import store from '@/store'

export default {
  name: 'history_approve_page',
  components: {
    Tables
  },
  data() {
    return {
      imageUrl: '',
      id: '',
      history_modal: false,
      modal_loading: false,
      columns: [
        {
          title: '序号',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index)
          }
        },
        {
          title: '任务名称',
          key: 'name',
          render: (h, params) => {
            return h(
              'Tooltip',
              {
                props: { placement: 'top' }
              },
              [
                this.maxSlice(params.row.name),
                h(
                  'span',
                  {
                    slot: 'content',
                    style: { whiteSpace: 'normal', wordBreak: 'break-all' }
                  },
                  params.row.name
                )
              ]
            )
          }
        },
        { title: '处理人', key: 'assignee' },
        // TODO: 添加协同人
        // {
        //   title: '当前任务节点',
        //   // key: 'taskList',
        //   width: 150,
        //   render: (h, params) => {
        //     const taskList = params.row.taskList
        //     var currentTask = ''
        //     if (!(taskList == null || taskList.size == 0)) {
        //       for (var i = 0; i < taskList.length; i++) {
        //         currentTask += taskList[i].name + ' |'
        //       }
        //     }
        //     return h('div', [
        //       h('span', {}, currentTask.substr(0, currentTask.length - 1))
        //     ])
        //   }
        // },
        {
          title: '耗时(m)',
          key: 'duration',
          render: (h, params) => {
            const duration = params.row.duration
            var text = ''
            if (duration != null) {
              text = (duration / 1000 / 60).toFixed(2)
            }
            return h('div', [h('span', {}, text)])
          }
        },
        { title: '开始时间', key: 'startTime', width: 200 },
        { title: '结束时间', key: 'endTime', width: 200 },
        { title: '审批结果', key: 'comment', width: 250 }
      ],
      tableData: []
    }
  },
  mounted() {
    this.id = this.$route.query.id
    this.loadTableData()
  },
 watch: {
    '$route' (to, from) {
        this.$router.go(0);
    }
},
  methods: {
    handleDelete(row) {
      this.delete_modal = true
      this.delete_id = row.id
    },
    exportExcel() {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
      })
    },
    handleClear(e) {
      if (e.target.value === '') this.insideTableData = this.value
    },
    loadTableData() {
      if (this.id == null || this.id == '') {
        this.$Message.error('ID为空！！！')
        return false
      }

      // 审批历史
      getHistoryTaskTableData(this.id).then(res => {
        if (res.data.success) {
          this.tableData = res.data.data
        } else {
          this.$Message.error(res.data.msg)
        }
      })

      // 流程图
      var url = this.$config.itcloudUrl + '/leave/process/trace/auto/' + this.id + '?Authorization=' + store.state.user.token
      this.imageUrl = url
    },
    cancel() {
      this.update_modal = false
      this.insert_modal = false
      this.allot_modal = false
    },
    refresh() {
      this.loadTableData()
    },
    // 分割字符串
    maxSlice(v) {
      if (v) {
        return v.length > 20 ? v.slice(0, 20) + '...' : v
      }
    }
  }
}
</script>

<style>
</style>
