<template>
  <div>
    <Card shadow title="社区">
      <row class="join-page" :gutter="32">
        <i-col span="12">
          <img class="qq-group-img" src="../assets/images/qq.jpg" style="width:250px;height:300px">
          <row type="flex" justify="center">
            <i-col span="12">
              <p>QQ 590418179</p>
            </i-col>
            <i-col span="12"></i-col>
          </row>
        </i-col>
        <i-col span="12">
          <div class="join-page-other">
            <!-- <Button to="https://blog.csdn.net/yy756127197" target="_blank" size="large" >
              <img src="../assets/images/icon-social-zhihu.svg" class="join-page-other-icon">
              CSDN博客
            </Button> -->
            <!-- <Button to="https://juejin.im/user/56fe494539b0570054f2e032" target="_blank" size="large">
              <img src="../assets/images/icon-social-juejin.svg" class="join-page-other-icon">
              掘金
            </Button>
            <Button to="https://live.bilibili.com/1353202" target="_blank" size="large">
              <img src="../assets/images/icon-social-bilibili.svg" class="join-page-other-icon">
              活动直播间
            </Button>
            <Button to="https://twitter.com/iViewUI" target="_blank" size="large">
              <img src="../assets/images/icon-social-twitter.svg" class="join-page-other-icon">
              Twitter
            </Button> -->

              <p slot="title"><h3>项目简介</h3></p>
              <p>IT服务管理平台（IT-CLOUD）是一个整合的运维管理平台，主要包括基础服务管理和中间件管理，
                另外整合工作学习中用到的种种技术。基于Spring Boot, Spring Cloud的前后端分离模式，
                前端使用Vue+iView Admin，后台使用Spring Boot 2.x/Shiro/Oauth2/Mybatis-Plus/Redis/RabbitMQ/NETTY/Druid/Swagger/Lombok/Quartz/Websocket/
                Elasticsearch/Activiti 熔断/负载均衡/验证码/Hutool工具类 等等。主要包含两大模块：基础服务，中间件管理 块权限管理 工作流 代码生成 日志记录 定时任务 第三方社交账号、短信登录
                </p>
          </div>
        </i-col>
      </row>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'join_page',
  data () {
    return {
    }
  }
}
</script>
<style>
  .join-page{
    text-align: center;
  }
  .qq-group-img{
    width: 100%;
  }
  .join-page-other-icon{
    width: 20px;
    vertical-align: middle;
    margin-right: 6px;
  }
  .join-page-other{
    text-align: left;
  }
  .join-page-other .ivu-btn{
    margin-right: 6px;
  }
</style>
