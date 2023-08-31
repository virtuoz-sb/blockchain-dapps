<template>
  <iframe
    scrolling="no"
    width="100%"
    allowtransparency="true"
    frameborder="0"
    src="https://cryptopanic.com/widgets/news/?bg_color=transparent&amp;font_family=sans&amp;font_size=11&amp;header_bg_color=transparent&amp;header_text_color=FFFFFF&amp;link_color=0083B8&amp;news_feed=recent&amp;posts_limit=4&amp;text_color=606675&amp;title=News"
    height="100%"
  />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "NewsWidget" })
export default class NewsWidget extends Vue {}
</script>
