<template>
  <Card style="height: 100%;width: 100%;">
    <div>
    <iframe
      :src= "src"
      scrolling="auto"
      frameborder="0"
      style="height: 570px;width: 100%;"
    ></iframe>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'druid_page',
  data () {
    return {
      src: this.$config.itcloudUrl + '/druid/sql.html'
    }
  }
}
</script>
