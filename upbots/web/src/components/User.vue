<template>
  <div class="flex flex-col relative">
    <!-- PREVIEW -->
    <div
      class="flex items-center justify-center w-32 h-32 text-sm leading-xs text-iceberg border-solid border-2 border-transparent gradient-5 ml-auto rounded-full cursor-pointer overflow-hidden"
      @click="isOpen = true"
    >
      <img v-if="userAvatar.type === 'img'" :src="userAvatar.value" alt="" />
      <span v-else>{{ userAvatar.value }}</span>
    </div>

    <!-- CONTENT -->
    <div v-if="isOpen" class="user__content absolute right-0 bg-san-juan shadow-130 rounded-3 overflow-hidden" :class="isOpen && 'z-120'">
      <div class="flex items-center border-b border-grey-cl-920 py-12 px-15">
        <div
          class="flex items-center justify-center w-30 h-30 text-white border border-solid border-downy ml-auto rounded-full overflow-hidden"
        >
          <img v-if="userAvatar.type === 'img'" :src="userAvatar.value" alt="" class="text-sm leading-xs" />
          <span v-else class="text-xs">{{ userAvatar.value }}</span>
        </div>

        <div class="flex flex-col ml-10">
          <span class="text-sm leading-xs text-iceberg mb-2">{{ user.firstname }}</span>
          <span class="text-sm leading-xs text-grey-cl-920">{{ user.email }}</span>
        </div>
      </div>

      <ul class="flex flex-col py-5">
        <router-link
          tag="li"
          :to="{ name: 'profile' }"
          class="user__content-item text-iceberg hover:text-turquoise-blue leading-xs px-15 py-7 cursor-pointer"
        >
          Profile
        </router-link>

        <router-link
          tag="li"
          :to="{ name: 'keys' }"
          class="user__content-item text-iceberg hover:text-turquoise-blue leading-xs px-15 py-7 cursor-pointer"
        >
          API key
        </router-link>
        <li class="user__content-item text-iceberg hover:text-turquoise-blue leading-xs px-15 py-7 cursor-pointer" @click="logOut">
          Log out
        </li>
      </ul>
    </div>

    <!-- BACKDROP -->
    <div v-if="isOpen" class="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-110" @click.stop="isOpen = false" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule");
const notifications = namespace("notificationsModule");

@Component({ name: "User" })
export default class User extends Vue {
  /* VUEX */
  @fromAuth.State private user!: any;
  @notifications.Action closeWebsocketConnection!: any;
  @fromAuth.Getter private userAvatar!: any;

  isOpen: boolean = false;

  /* COMPUTED */
  get avaterName() {
    return this.user.firstname[0].toUpperCase();
  }

  /* METHODS */
  logOut() {
    // GA Event
    this.$gtag.event("logout", { event_category: "engagement", event_label: "method" });

    this.closeWebsocketConnection();
    this.$router.push("/login");
  }
}
</script>

<style lang="scss" scoped>
.user {
  &__content {
    top: 40px;
  }
  &__content-item {
    transition: 0.3s ease-in;
  }
}
</style>
