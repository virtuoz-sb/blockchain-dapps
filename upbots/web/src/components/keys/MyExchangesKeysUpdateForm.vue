<template>
  <div v-if="form">
    <ValidationObserver ref="form" tag="div">
      <form @submit.prevent="handleSubmit" class="flex flex-col items-center">
        <label class="w-full mb-35">
          <span class="text-iceberg text-sm">API Key Label</span>
          <AppInput v-model="form.name" placeholder="Enter a Key Label" name="Key label" class="mt-8" size="sm" rules="required" />
        </label>
        <label class="w-full mb-45">
          <span class="text-iceberg text-sm">API Key</span>
          <AppInput
            v-model="form.publicKey"
            show-last
            disabled
            placeholder="API Key"
            class="mt-8"
            name="API Key"
            size="sm"
            rules="required"
          />
        </label>
        <AppButton type="light-green" class="save-btn">Save</AppButton>
      </form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ExchangeKey } from "@/store/exchangeKeys/types";

@Component({ name: "MyExchangesKeysUpdateForm" })
export default class MyExchangesKeysUpdateForm extends Vue {
  /* PROPS */
  @Prop({ required: true }) data!: ExchangeKey;

  /* REFS */
  $refs!: {
    form: HTMLFormElement;
  };

  /* DATA */
  form: any = null;

  /* HOOKS */
  created() {
    this.form = { ...this.data };
  }

  /* METHODS */
  handleSubmit() {
    this.$refs.form.validate().then((valid: Boolean) => {
      if (valid) {
        const { id, name } = this.form;
        this.$emit("update", { id, name });
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.table-wrap {
  height: calc(100% - 46px);
}

.save-btn {
  min-width: 240px;
}
</style>
