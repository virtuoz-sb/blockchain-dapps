<template>
  <GeneralLayout title="Learning" content-custom-classes="overflow-y-auto custom-scrollbar">
    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="flex flex-col w-full relative overflow-x-hidden custom-scrollbar">
      <div class="flex flex-grow overflow-y-auto custom-scrollbar">
        <div class="flex flex-col w-full">
          <!-- COURSE VIDEO -->
          <CourseVideo :data="data" />

          <div>
            <div class="about-tabs__wrap w-full flex flex-col bg-dark-200 rounded-t-3">
              <!-- APP TABS -->
              <AppTabs :tabs="tabs">
                <template v-slot="{ currentTab }">
                  <component :is="currentTab.componentName" :data="data" />
                </template>
              </AppTabs>
            </div>
          </div>
        </div>

        <div class="lessons__wrap w-full flex-shrink-0 pb-16 overflow-y-auto custom-scrollbar pr-16 pt-16 pl-30 lg:pl-40">
          <!-- LESSONS -->
          <Card
            class="flex flex-col h-full bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar"
            header-classes="flex items-center justify-between"
          >
            <template slot="header-left">
              <span class="leading-md text-white">Lessons</span>
            </template>

            <template slot="header-right">
              <ul class="flex items-center">
                <li v-for="(item, index) in data.lessons.headerList" :key="index" class="flex items-center">
                  <span v-if="index !== 0" class="w-3 h-3 bg-grey-cl-100 rounded-full mx-10" />
                  <span class="text-base leading-md text-grey-cl-100">{{ item }}</span>
                </li>
              </ul>
            </template>

            <Lessons slot="content" :data="data.lessons" />
          </Card>
        </div>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="isComingSoon" class="flex flex-col w-full h-ful relative rounded-t-15 overflow-hidden">
        <!-- CONTENT -->
        <CourseVideo :data="data" class="flex-grow" />

        <div class="mobile-tabs flex flex-col w-full relative h-full bg-dark-200">
          <AppTabs :tabs="mobileTabs" shrink>
            <template v-slot="{ currentTab }">
              <!-- LESSONS TAB -->
              <template v-if="currentTab.componentName === 'Lessons'">
                <Lessons :data="data.lessons" />
              </template>

              <!-- ABOUT TAB -->
              <template v-if="currentTab.componentName === 'About'">
                <AboutCourse :data="data" />
              </template>

              <!-- AUTHOR TAB -->
              <template v-if="currentTab.componentName === 'Author'">
                <AboutAuthor :data="data" />
              </template>
            </template>
          </AppTabs>
        </div>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </template>
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import CourseVideo from "@/components/learning/course/CourseVideo.vue";
import AboutCourse from "@/components/learning/course/AboutCourse.vue";
import AboutAuthor from "@/components/learning/course/AboutAuthor.vue";
import Lessons from "@/components/learning/course/Lessons.vue";

@Component({
  name: "Learning",
  components: { GeneralLayout, CourseVideo, AboutCourse, AboutAuthor, Lessons },
  mixins: [ComingSoon],
})
export default class Learning extends Vue {
  /* DATA */
  tabs: Tab[] = [
    { value: "About the course", componentName: "AboutCourse" },
    { value: "About the author", componentName: "AboutAuthor" },
  ];

  mobileTabs: Tab[] = [
    { value: "Lessons", componentName: "Lessons" },
    { value: "About", componentName: "About" },
    { value: "Author", componentName: "Author" },
  ];

  data: object = {
    img: require("@/assets/images/learning/course-video/course-video.png"),
    aboutCourse: {
      title: "Blockchain for beginners",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
      list: ["Fully-automated technical-analysis-based trading approach", "Fully-automated technical-analysis-based trading approach"],
      learnList: ["Fondamental Analysis", "Technical Analysis", "Chartism", "Risk Management", "Trading Style"],
    },
    aboutAuthor: {
      title: "Blockchain for beginners",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
      list: ["Fully-automated technical-analysis-based trading approach", "Fully-automated technical-analysis-based trading approach"],
      learnList: ["Fondamental Analysis", "Technical Analysis", "Chartism", "Risk Management", "Trading Style"],
    },
    lessons: {
      isAllow: true,
      headerList: ["19 Sessions", "30 Hours"],
      price: "Enroll (100UBX)",
      lessonsList: [
        { id: 1, isDone: true, title: "Trading Mindset", subtitle: "Lesson 1" },
        { id: 2, isDone: true, title: "Trading Mindset", subtitle: "Lesson 2" },
        { id: 3, isDone: false, title: "Trading Mindset", subtitle: "Lesson 3" },
        { id: 4, isDone: false, title: "Trading Mindset", subtitle: "Lesson 4" },
        { id: 5, isDone: false, title: "Trading Mindset", subtitle: "Lesson 5" },
        { id: 6, isDone: false, title: "Trading Mindset", subtitle: "Lesson 6" },
        { id: 7, isDone: false, title: "Trading Mindset", subtitle: "Lesson 7" },
        { id: 8, isDone: false, title: "Trading Mindset", subtitle: "Lesson 8" },
        { id: 9, isDone: false, title: "Trading Mindset", subtitle: "Lesson 9" },
        { id: 10, isDone: false, title: "Trading Mindset", subtitle: "Lesson 10" },
        { id: 11, isDone: false, title: "Trading Mindset", subtitle: "Lesson 11" },
        { id: 12, isDone: false, title: "Trading Mindset", subtitle: "Lesson 12" },
        { id: 13, isDone: false, title: "Trading Mindset", subtitle: "Lesson 13" },
      ],
    },
  };
}
</script>

<style lang="scss" scoped>
.lessons {
  &__wrap {
    max-width: 396px;
    min-height: 785px;
    @media (max-width: 1024px) {
      max-width: 320px;
    }
  }
}

.about-tabs {
  &__wrap {
    min-height: 270px;
  }
}

.mobile-tabs {
  height: calc(100% - 190px);
}
</style>
