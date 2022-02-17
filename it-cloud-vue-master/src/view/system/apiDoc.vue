
<template>
  <Card style="height: 100%;width: 100%;">
    <div>
    <iframe
      :src="src"
      scrolling="auto"
      frameborder="0"
      style="height: 570px;width: 100%;"
    ></iframe>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'api_doc_page',
  data () {
    return {
      src: this.$config.itcloudUrl + '/swagger-ui.html'
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
