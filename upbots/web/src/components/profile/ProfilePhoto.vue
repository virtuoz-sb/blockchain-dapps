<template>
  <div class="flex flex-row md:flex-col items-center justify-start md:justify-center flex-shrink-0 md:px-20 md:py-20">
    <div class="profile-photo__inner flex relative cursor-pointer">
      <div id="pick-avatar" class="profile-img__wrap">
        <img v-if="userAvatar.type === 'img'" :src="userAvatar.value" alt="profile" class="w-full h-full object-cover rounded-full" />
        <span
          v-else
          class="flex items-center justify-center w-full h-full text-xxxl2 leading-xs text-iceberg border-solid border-2 border-downy ml-auto rounded-full cursor-pointer overflow-hidden"
        >
          {{ userAvatar.value }}
        </span>
      </div>
      <div class="profile-edit hidden absolute top-1/2 left-1/2 items-center text-iceberg transform -translate-y-1/2 -translate-x-1/2">
        <span class="icon-edit text-12 mr-5" />
        <span class="text-12">Edit</span>
      </div>
    </div>

    <!-- @uploading="handleUploading" -->
    <AvatarCropper
      :key="$breakpoint.name"
      ref="avatarCropper"
      @uploaded="handleUploaded"
      @error="handlerError"
      trigger="#pick-avatar"
      :upload-url="uploadUrl"
      :output-quality="outputQuality"
      :output-options="outputOptions"
      :labels="labels"
      :upload-headers="uploadHeader"
    />

    <div class="flex flex-col mt-0 md:mt-10 ml-20 md:ml-0 text-left md:text-center mr-20 md:mr-0">
      <span class="text-turquoise-blue text-xl1 md:text-xxl mb-2">{{ user.fullname }}</span>
      <span class="text-iceberg text-xs md:text-base leading-md">Member Since: {{ user.created | dateLocal }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

const auth = namespace("authModule");

import AvatarCropper from "vue-avatar-cropper";

@Component({ name: "ProfilePhoto", components: { AvatarCropper } })
export default class ProfilePhoto extends Vue {
  /* VUEX */
  @auth.State user!: any;
  @auth.State jwt: string;
  @auth.Getter userAvatar: any;
  @auth.Mutation profilePictureUpdate: Function;

  /* DATA */
  uploadUrl = `${process.env.VUE_APP_ROOT_API}/api/account/picture`;
  labels = { submit: "submit", cancel: "cancel" };
  outputQuality = 0.5;
  outputOptions = { width: 256, height: 256 };

  /* COMPUTED */
  get uploadHeader() {
    return { Authorization: `Bearer ${this.jwt}` };
  }

  /* METHODS */
  handleUploaded({ status, mimetype, data }: any) {
    if (status == "success") {
      this.profilePictureUpdate({ mimetype, data });
    }
  }

  handlerError(message: any, type: any, xhr: any) {
    if (xhr.status === 401) {
      this.$router.push("login");
    }
    this.$notify({ text: "Profil picture upload failed.", type: "error" });
  }
}
</script>

<style lang="scss" scoped>
.profile-photo {
  &__inner {
    &:hover {
      .profile-edit {
        @apply flex;
      }
      .profile-img {
        &__wrap {
          @apply opacity-20;
        }
      }
    }
  }
}

.profile-img {
  &__wrap {
    height: 160px;
    width: 160px;
    transition: ease-in-out 0.2s;
    @media (max-width: 1279px) {
      @apply w-100 h-100;
    }
  }
}
</style>
