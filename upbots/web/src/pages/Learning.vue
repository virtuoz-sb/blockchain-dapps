<template>
  <GeneralLayout title="Learning" content-custom-classes="overflow-y-auto overflow-x-hidden custom-scrollbar">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full h-full relative">
      <!-- COURSES -->
      <div class="flex flex-col w-full h-full">
        <div class="my-courses w-full flex flex-col bg-dark-200 rounded-3 mb-40">
          <!-- APP TABS -->
          <AppTabs :tabs="tabs">
            <template v-slot="{ currentTab }">
              <!-- MY COURSES -->
              <template v-if="currentTab.componentName === 'MyCourses'">
                <MyCourses />
              </template>

              <!-- COMPLETED COURSES -->
              <template v-if="currentTab.componentName === 'CompletedCourses'">
                <CompletedCourses />
              </template>

              <!-- MY ACHIEVEMENTS -->
              <template v-if="currentTab.componentName === 'MyAchievements'">
                <MyAchievements />
              </template>
            </template>
          </AppTabs>
        </div>

        <!-- TRAININGS -->
        <div class="trainings">
          <Card class="flex flex-col h-full bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar" header-classes="flex items-center">
            <template slot="header-left">
              <span class="leading-md text-white">All Trainings</span>
            </template>

            <div slot="content" class="trainings__card-shadow relative h-full flex flex-col overflow-y-auto custom-scrollbar px-20 pt-20">
              <TrainingsFilters
                slot="filters"
                :active-filters="activeFilters"
                :available-filters="availableFilters"
                class="mb-10"
                @handle-search="handleSearch"
                @change="handleFilters"
              />

              <!-- TRAININS CARDS -->
              <div class="relative h-full pb-20 overflow-y-auto custom-scrollbar">
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 row-gap-40 col-gap-30 pt-20">
                  <TrainingsCard :data="item" v-for="item in trainingData" :key="item.id" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- COMING SOON -->
      <ComingSoonDesktop v-if="isComingSoon" />
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="isComingSoon" class="w-full flex flex-col relative bg-dark-200 rounded-t-15">
        <!-- CONTENT -->
        <AppTabs :tabs="mobileTabs" shrink>
          <template v-slot="{ currentTab }">
            <!-- TRAININGS TAB -->
            <template v-if="currentTab.componentName === 'AllTrainings'">
              <div class="relative h-full flex flex-col overflow-y-auto custom-scrollbar px-20 pt-20">
                <TrainingsFilters
                  slot="filters"
                  :active-filters="activeFilters"
                  :available-filters="availableFilters"
                  class="mb-10"
                  @handle-search="handleSearch"
                  @change="handleFilters"
                />

                <!-- TRAININS CARDS -->
                <div class="relative h-full pb-20 overflow-y-auto custom-scrollbar">
                  <div class="grid grid-cols-1 row-gap-50 pt-20">
                    <TrainingsCard :data="item" v-for="item in trainingData" :key="item.id" />
                  </div>
                </div>
              </div>
            </template>

            <!-- MY COURSES TAB -->
            <template v-if="currentTab.componentName === 'MyCourses'">
              <div class="flex flex-col h-full py-20 overflow-y-auto custom-scrollbar">
                <div class="flex items-center mb-30 px-20">
                  <p class="text-grey-cl-920 leading-xs text-md mr-8">Courses:</p>
                  <AppDropdownBasic v-model="mobileCoursesViewValue" :options="mobileCoursesViewData" dark />
                </div>

                <!-- MY COURSES -->
                <template v-if="mobileCoursesViewValue.value === 'MyCourses'">
                  <MyCourses />
                </template>

                <!-- COMPLETED COURSES -->
                <template v-if="mobileCoursesViewValue.value === 'CompletedCourses'">
                  <CompletedCourses />
                </template>

                <!-- MY ACHIEVEMENTS -->
                <template v-if="mobileCoursesViewValue.value === 'MyAchievements'">
                  <MyAchievements />
                </template>
              </div>
            </template>
          </template>
        </AppTabs>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Tab } from "@/models/interfaces";
import { decodeRouteQuery } from "@/core/services/training.service.ts";
import debounce from "@/core/debounce";
import { GroupItems } from "@/models/interfaces";

import { ComingSoon } from "@/core/mixins/coming-soon";

const training = namespace("trainingModule");

import GeneralLayout from "@/views/GeneralLayout.vue";
import MyCourses from "@/components/learning/courses/MyCourses.vue";
import CompletedCourses from "@/components/learning/courses/CompletedCourses.vue";
import MyAchievements from "@/components/learning/courses/MyAchievements.vue";
import TrainingsFilters from "@/components/learning/trainings/TrainingsFilters.vue";
import LearningComingSoon from "@/components/learning/LearningComingSoon.vue";
import TrainingsCard from "@/components/learning/trainings/TrainingsCard.vue";

@Component({
  name: "Learning",
  components: { GeneralLayout, MyCourses, CompletedCourses, MyAchievements, TrainingsFilters, LearningComingSoon, TrainingsCard },
  mixins: [ComingSoon],
})
export default class Learning extends Vue {
  /* VUEX */
  @training.State training!: any;
  @training.State activeFilters!: any;
  @training.State availableFilters!: any;
  @training.Action fetchTrainings!: any;
  @training.Action fetchFilters!: any;
  @training.Action initialFillDatabase!: any;

  /* DATA */
  tabs: Tab[] = [
    { value: "My Courses", componentName: "MyCourses" },
    { value: "Completed Courses", componentName: "CompletedCourses" },
    { value: "My achievements", componentName: "MyAchievements" },
  ];

  mobileTabs: Tab[] = [
    { value: "All trainings", componentName: "AllTrainings" },
    { value: "My courses ", componentName: "MyCourses" },
  ];

  mobileCoursesViewValue: object = { value: "MyCourses", label: "My courses" };

  mobileCoursesViewData: GroupItems[] = [
    { value: "MyCourses", label: "My courses" },
    { value: "CompletedCourses", label: "Completed Courses" },
    { value: "MyAchievements", label: "MyAchievements" },
  ];

  isFetchedFilters: boolean = false;
  initialSeedFetch: boolean = false;

  trainingImgData: any[] = [
    require("@/assets/images/learning/trainings/img-1.png"),
    require("@/assets/images/learning/trainings/img-2.png"),
    require("@/assets/images/learning/trainings/img-3.png"),
    require("@/assets/images/learning/trainings/img-4.png"),
    require("@/assets/images/learning/trainings/img-5.png"),
    require("@/assets/images/learning/trainings/img-6.png"),
    require("@/assets/images/learning/trainings/img-7.png"),
  ];

  /* COMPUTED */
  get trainingData() {
    return this.training.map((el: any, i: number) => {
      return { img: this.trainingImgData[i], ...el };
    });
  }

  /* WATCHERS */
  @Watch("$route.query", { immediate: true })
  async queryHandler(query: any) {
    /* T E M P O R A R Y this request needed to initial fill database will delete soon  T E M P O R A R Y */
    await this.initialFetch();

    if (!this.isFetchedFilters) {
      this.fetchFilters().then(() => {
        this.isFetchedFilters = true;
      });
    }

    this.fetchTrainings(query);
  }

  /* METHODS */
  handleFilters(type: any, item: any) {
    const { query } = this.$route;
    const decodedData = decodeRouteQuery(query, type, item._id);
    this.$router.push({ query: decodedData });
  }

  @debounce(400)
  handleSearch(value: any) {
    const { query } = this.$route;
    const decodedData = decodeRouteQuery(query, "search", value);
    this.$router.push({ query: decodedData });
  }

  initialFetch() {
    if (!this.initialSeedFetch) {
      return this.initialFillDatabase().then(() => (this.initialSeedFetch = true));
    }
  }
}
</script>

<style lang="scss" scoped>
.my-courses {
  height: 146px;
}

.trainings {
  height: calc(100% - 186px);
  &__card-shadow {
    &:after {
      content: "";
      @apply absolute w-full h-56 bottom-0 left-0;
      background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
    }
  }
}
</style>
