<template>
  <Row>
    <Col span="12">
      <Card style="height:550px">
        <Form ref="formValidate" :label-width="80">
          <FormItem label="Desc" prop="msg">
            <Input v-model="msg" type="textarea" :autosize="{minRows: 10,maxRows: 15}" />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="send()">测试发送消息给服务器</Button>
            <Button @click="receive()" style="margin-left: 8px">测试接收服务器消息</Button>
          </FormItem>
        </Form>
      </Card>
    </Col>
    <Col span="12">
      <Card style="height:550px">
        <Timeline pending>
          <TimelineItem v-for="(item, index) in list" :key="`search-col-${index}`">{{item}}</TimelineItem>
        </Timeline>
      </Card>
    </Col>
  </Row>
</template>

<script>
// 整编文章不进行规格检查
/* eslint-disable */
import axios from '@/libs/api.request'

export default {
  data () {
    return {
      path: 'ws://www.yyitcloud.com:8081/websocket/20',
      // this.$config.itcloudUrl + 
      socket: '',
      msg: '',
      list: ['123', '234', '333']
    }
  },
  mounted () {
    // 初始化
    this.init()
  },
  methods: {
    init: function() {
      if (typeof WebSocket === 'undefined') {
        alert('您的浏览器不支持socket')
      } else {
        // 实例化socket
        this.socket = new WebSocket(this.path)
        // 监听socket连接
        this.socket.onopen = this.open
        // 监听socket错误信息
        this.socket.onerror = this.error
        // 监听socket消息
        this.socket.onmessage = this.getMessage
      }
    },
    open: function() {
      console.log('socket连接成功')
    },
    error: function() {
      console.log('连接错误')
    },
    getMessage: function(msg) {
      console.log(msg.data)
      this.list.push(msg.data)
    },
    // 主动发送
    send: function() {
      this.socket.send("[{'toUserId':'20', 'contentText':'哈哈'}]")
    },
    close: function() {
      console.log('socket已经关闭')
    },
    // 主动发送
    receive: function() {
      console.log('socket已经关闭')
      axios
        .request({
          url: 'socket/push/20',
          method: 'get',
          params: {
            message: this.msg
          }
        })
        .then(res => {
          if (res.data.success) {
            this.$Message.success('操作成功')
          } else {
            this.$Message.error(res.data.msg)
          }
        })

    }
  },
  destroyed() {
    // 销毁监听
    this.socket.onclose = this.close
  }
}
</script>

<style>
</style>
