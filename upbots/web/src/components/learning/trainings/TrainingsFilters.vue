<template>
  <div class="flex items-center flex-wrap">
    <!-- SEARCH -->
    <AppInput
      class="search-input md:mr-30 mb-12"
      v-model="searching"
      type="text"
      placeholder="Search"
      custom-class="pl-38 pr-20"
      size="sm"
      @input="(value) => $emit('handle-search', value)"
    >
      <span class="absolute left-10 top-1/2 transform -translate-y-1/2 icon-search text-grey-cl-100 text-xl1"></span>
    </AppInput>

    <!-- LANGUAGE -->
    <div class="flex items-center mr-20 md:mr-30 md:pr-30 md:border-r md:border-grey-cl-400 mb-12">
      <div class="flex items-start">
        <p class="text-grey-cl-100 text-sm leading-xs mr-8">Language:</p>
        <AppDropdownBasic
          :value="defaultLabels.languages"
          :options="availableFilters.languages"
          key-label="name"
          key-value="_id"
          dark
          @change="(item) => handleFilterSelection('languages', item)"
        />
      </div>
      <div v-if="activeFilters.languages.length" class="exchange__tags-wrap flex items-center ml-8">
        <div
          v-for="item in activeFilters.languages"
          :key="item.id"
          class="exchange__tag flex items-center bg-blue-cl-100 text-white rounded-5 px-8 mr-10 last:mr-0"
        >
          <span class="text-sm mr-3">{{ item.name }}</span>
          <i class="text-xxs icon-cross mt-2 cursor-pointer" @click="handleFilterSelection('languages', item)" />
        </div>
      </div>
    </div>

    <!-- TOPIC -->
    <div class="flex items-center mr-20 md:mr-30 md:pr-30 md:border-r md:border-grey-cl-400 mb-12">
      <div class="flex items-start">
        <p class="text-grey-cl-100 text-sm leading-xs mr-8">Topic:</p>
        <AppDropdownBasic
          :value="defaultLabels.topics"
          :options="availableFilters.topics"
          key-label="name"
          key-value="_id"
          dark
          @change="(item) => handleFilterSelection('topics', item)"
        />
      </div>
      <div v-if="activeFilters.topics.length" class="exchange__tags-wrap flex items-center ml-8">
        <div
          v-for="item in activeFilters.topics"
          :key="item.id"
          class="exchange__tag flex items-center bg-blue-cl-100 text-white rounded-5 px-8 mr-10 last:mr-0"
        >
          <span class="text-sm mr-3">{{ item.name }}</span>
          <i class="text-xxs icon-cross mt-2 cursor-pointer" @click="handleFilterSelection('topics', item)" />
        </div>
      </div>
    </div>

    <!-- FORMAT -->
    <div class="flex items-center mr-20 md:mr-30 md:pr-30 md:border-r md:border-grey-cl-400 mb-12">
      <div class="flex items-start">
        <p class="text-grey-cl-100 text-sm leading-xs mr-8">Format:</p>
        <AppDropdownBasic
          :value="defaultLabels.formats"
          :options="availableFilters.formats"
          key-label="name"
          key-value="_id"
          dark
          @change="(item) => handleFilterSelection('formats', item)"
        />
      </div>
      <div v-if="activeFilters.formats.length" class="exchange__tags-wrap flex items-center ml-8">
        <div
          v-for="item in activeFilters.formats"
          :key="item.id"
          class="exchange__tag flex items-center bg-blue-cl-100 text-white rounded-5 px-8 mr-10 last:mr-0"
        >
          <span class="text-sm mr-3">{{ item.name }}</span>
          <i class="text-xxs icon-cross mt-2 cursor-pointer" @click="handleFilterSelection('formats', item)" />
        </div>
      </div>
    </div>

    <!-- LEVEL -->
    <div class="flex items-center mb-12">
      <div class="flex items-start">
        <p class="text-grey-cl-100 text-sm leading-xs mr-8">Level:</p>
        <AppDropdownBasic
          :value="defaultLabels.levels"
          :options="availableFilters.levels"
          key-label="name"
          key-value="_id"
          dark
          @change="(item) => handleFilterSelection('levels', item)"
        />
      </div>
      <div v-if="activeFilters.levels.length" class="exchange__tags-wrap flex items-center ml-8">
        <div
          v-for="item in activeFilters.levels"
          :key="item.id"
          class="exchange__tag flex items-center bg-blue-cl-100 text-white rounded-5 px-8 mr-10 last:mr-0"
        >
          <span class="text-sm mr-3">{{ item.name }}</span>
          <i class="text-xxs icon-cross mt-2 cursor-pointer" @click="handleFilterSelection('levels', item)" />
        </div>
      </div>
    </div>

    <!-- RESET FILTERS -->
    <div class="flex items-center ml-auto cursor-pointer mb-12" @click="resetFilters">
      <span class="icon-cross text-blue-cl-100 text-xxs mr-6 mt-2" />
      <span class="text-blue-cl-100 text-sm leading-xs">Reset All Filters</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

const training = namespace("trainingModule");

@Component({ name: "TrainingsFilters" })
export default class TrainingsFilters extends Vue {
  /* VUEX */
  @training.State search!: any;
  @training.Mutation setSearch!: any;

  /* PROPS */
  @Prop({ required: true }) activeFilters!: any;
  @Prop({ required: true }) availableFilters!: any;

  /* DATA */
  defaultLabels: any = {
    languages: { name: "Select languages", _id: "1" },
    topics: { name: "Select topics", _id: "1" },
    formats: { name: "Select formats", _id: "1" },
    levels: { name: "Select levels", _id: "1" },
  }; // default select value

  /* COMPUTED */
  get searching() {
    return this.search;
  }

  set searching(value) {
    this.setSearch(value);
  }

  /* METHODS */
  handleFilterSelection(type: string, item: any) {
    this.$emit("change", type, item);
  }

  resetFilters() {
    this.searching = null;
    // Clear query
    this.$router.push({ query: {} });
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  @apply w-full;

  @media (min-width: 768px) {
    max-width: 240px;
  }
}
</style>
