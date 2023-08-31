<template>
  <div :class="isOpen && 'z-200'">
    <div class="relative">
      <!-- PREVIEW -->
      <div
        class="notifications__icon-wrap flex items-center justify-center relative h-32 w-32 bg-abyssal-anchorfish-blue hover:bg-astral rounded-full cursor-pointer"
        @click="isOpen = true"
      >
        <i class="icon-notification text-astral text-md" />
        <transition name="fade">
          <div
            v-if="getUnreadNotifCount > 0"
            class="notifications__count-wrap flex items-center justify-start absolute w-11 h-11 bg-red-orange text-center rounded-full"
          >
            <span class="notifications__count flex leading-normal text-white m-auto">{{ getUnreadNotifCount }}</span>
          </div>
        </transition>
      </div>

      <!-- CONTENT -->
      <transition name="fade">
        <div
          v-if="isOpen && notifications.length"
          class="notifications__content-inner absolute right-0 flex flex-col bg-san-juan rounded-5 overflow-y-auto custom-scrollbar z-2"
        >
          <ul class="notifications__content-wrap flex flex-col mt-7 overflow-y-auto custom-scrollbar">
            <router-link
              to="/notifications"
              v-for="(item, index) in notifications"
              :key="index"
              :class="!item.isRead && 'is-unread'"
              class="notifications__content-item flex flex-col flex-shrink-0 py-8 px-10 cursor-default"
              @click.native="isOpen = false"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm leading-xs text-white">
                  {{ item.title ? item.title : `${item.exch.toUpperCase()} : ${item.status}` }}
                </span>
                <span class="text-xs leading-xs text-white">{{ item.logtime | date("h:mm:ss A") }}</span>
              </div>
              <div class="flex">
                <span class="block truncate text-xs text-grey-cl-920">
                  {{ item.description ? item.description : `${item.sbl}: ${item.qOrig} - ${item.qExec}` }}
                </span>
              </div>
            </router-link>
          </ul>
        </div>
      </transition>
    </div>

    <!-- BACKDROP -->
    <div v-if="isOpen && notifications.length" class="fixed top-0 bottom-0 left-0 right-0 h-full w-full" @click="isOpen = false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

const notifications = namespace("notificationsModule");

@Component({ name: "Notifications" })
export default class Notifications extends Vue {
  /* VUEX */
  @notifications.State notifications!: any;
  @notifications.Action fetchReadUnreadNotifications: () => Promise<Notification[]>;
  @notifications.Getter getReadUnreadNotifications: Notification[];
  @notifications.Getter getUnreadNotifCount: number;
  @notifications.State error: any;

  /* DATA */
  isOpen: boolean = false;
  newNotification: boolean = false;

  /* WATCHERS */

  // @Watch("notifications")
  // handleNewNotification() {
  //  this.newNotification = true;
  //  setTimeout(() => {
  //    if (this.newNotification) {
  //      this.newNotification = false;
  //    } else {
  //      this.newNotification = true;
  //    }
  //  }, 1000);
  //}

  /* HOOKS */
  async mounted() {
    await this.fetchReadUnreadNotifications();
    if (!this.error) {
      if (this.getReadUnreadNotifications && this.getReadUnreadNotifications.length > 0) {
        this.newNotification = true;
      }
    } else {
      this.$notify({ text: this.error.message, type: "error" });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utils/_animation";
@import "@/assets/scss/animations/_bell-animations";

.notifications {
  &__icon-wrap {
    transition: all 0.2s;
    &:hover {
      .icon-notification {
        @apply text-white;
      }
    }
  }

  &__count-wrap {
    right: -1px;
    top: -1px;
    transition: ease-in 0.3s;
  }

  &__count {
    font-size: 6px;
  }

  &__content-inner {
    top: 36px;
    right: -7px;
    width: 210px;
    height: 173px;
  }

  &__content-item {
    transition: all 0.3s linear;
    &.is-unread {
      background: rgba(46, 47, 51, 0.4);
    }
  }
}
</style>
