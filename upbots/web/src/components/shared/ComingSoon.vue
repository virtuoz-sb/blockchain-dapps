<template>
  <div
    class="coming-soon flex flex-col w-full h-full relative rounded-3"
    :style="`background: url(${background}) no-repeat center center / cover`"
  >
    <div class="flex flex-col items-center justify-center w-full h-full relative z-2">
      <h2 class="coming-soon__title text-blue-cl-500 text-shadow-3 mb-5">Coming Soon</h2>
      <p class="text-md leading-md text-white">We are currently working on this page, stay tuned!</p>
    </div>
    <!-- TIMER IF NEEDED -->
    <!-- <div>
      <span class="d-flex flex-column align-center">
        <span class="display-2 primary--text">{{ days | twoDigits }}</span>
        <span>{{ days === 1 ? "Day" : "Days" }}</span>
      </span>

      <span class="d-flex flex-column align-center">
        <span class="display-2 primary--text">{{ hours | twoDigits }}</span>
        <span>{{ hours === 1 ? "Hour" : "Hours" }}</span>
      </span>

      <span class="d-flex flex-column align-center">
        <span class="display-2 primary--text">{{ minutes | twoDigits }}</span>
        <span>{{ minutes === 1 ? "Minute" : "Minutes" }}</span>
      </span>

      <span class="d-flex flex-column align-center">
        <span class="display-2 primary--text">{{ seconds | twoDigits }}</span>
        <span>{{ seconds === 1 ? "Second" : "Seconds" }}</span>
      </span>
    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
// import moment from "moment";

// let interval: any = null;

@Component({ name: "ComingSoon" })
export default class ComingSoon extends Vue {
  /* PROPS */
  // @Prop({ required: true }) endDate: string;

  /* DATA */
  background: any = "/img/coming-soon/coming-soon-desktop.jpg";

  // now: any = Math.trunc(new Date().getTime() / 1000);
  // diff: any = 0;

  /* COMPUTED */

  // get seconds() {
  //   return Math.trunc(this.diff) % 60;
  // }
  // get minutes() {
  //   return Math.trunc(this.diff / 60) % 60;
  // }
  // get hours() {
  //   return Math.trunc(this.diff / 60 / 60) % 24;
  // }
  // get days() {
  //   return Math.trunc(this.diff / 60 / 60 / 24);
  // }

  /* METHODS */

  // initCountDown() {
  //   const end = moment(this.endDate).unix();
  //   this.now = Math.trunc(new Date().getTime() / 1000);

  //   const diff = end - this.now;
  //   this.diff = diff <= 0 ? 0 : diff;

  //   if (diff <= 0) {
  //     this.$emit("countdown:over");
  //     return;
  //   }

  //   interval = setInterval(() => {
  //     this.now = Math.trunc(new Date().getTime() / 1000);
  //   }, 1000);
  // }

  /*  WATCHERS */
  // @Watch("now")
  // nowHandler() {
  //   const end = moment(this.endDate).unix();

  //   this.diff = end - this.now;
  //   if (this.diff <= 0) {
  //     this.$emit("countdown:over");
  //     this.diff = 0;
  //     // Remove interval
  //     clearInterval(interval);
  //   }
  // }

  /* HOOKS */

  // created() {
  //   this.initCountDown();
  // }

  // destroyed() {
  //   clearInterval(interval);
  // }
}
</script>

<style lang="scss" scoped>
.coming-soon {
  &:after {
    content: "";
    @apply absolute left-0 top-0 w-full h-full;
    background: rgba(27, 49, 58, 0.8);
  }
  &__title {
    font-size: 55px;
  }
}
</style>
