<template>
  <GeneralLayout title="Algobot" content-custom-classes="md:flex-col overflow-y-auto custom-scrollbar">
    <!-- HEADER LEFT -->
    <router-link slot="header-nav-left-start" to="/my-bots" tag="div" class="flex items-center flex-shrink-0 cursor-pointer mr-20">
      <i class="icon-arrow-back text-xxl text-blue-cl-100" />
    </router-link>

    <!-- DESKTOP CONTENT -->
    <div v-if="!$breakpoint.smAndDown" class="w-full relative overflow-x-hidden custom-scrollbar">
      <div class="flex flex-col w-full overflow-y-auto custom-scrollbar">
        <div class="flex flex-col h-full">
          <!-- PROGRESS BAR -->
          <ProgressBar :data="createNewBotSteps" :current-step="currentStep" />

          <!-- CONTENT -->
          <div class="create-new-bot__content flex h-full">
            <Card
              class="bot-result__inner w-full flex flex-col bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar mr-20 lg:mr-30 xl:mr-40"
              header-classes="flex items-center"
            >
              <template slot="header-left">
                <span class="leading-md text-white">
                  {{ result && result.botParameters.botName ? result.botParameters.botName : "Bot Name" }}
                </span>
              </template>

              <!-- BOT RESULT -->
              <BotResult slot="content" :data="result" />
            </Card>

            <Card
              class="bot-content__inner flex flex-col flex-grow bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar"
              header-classes="flex items-center"
            >
              <template slot="header-left">
                <span class="leading-md text-white">{{ currentStep.label }}</span>
              </template>

              <div slot="content" class="flex flex-col overflow-y-auto custom-scrollbar h-full pt-20">
                <div class="flex flex-col overflow-y-auto custom-scrollbar h-full px-20">
                  <!-- BOT FIELDS -->
                  <keep-alive>
                    <component ref="step" :is="currentStep.componentName" :bot-type="result.botParameters.botType" />
                  </keep-alive>

                  <!-- ACTIONS BUTTONS -->
                  <div class="flex justify-end items-center mt-auto pb-20">
                    <template v-if="!$breakpoint.mdAndDown">
                      <div
                        v-if="currentStep.step > 2 && currentStep.step !== 5"
                        class="text-blue-cl-200 text-sahdow-5 cursor-pointer mr-40 px-20 py-10"
                        @click="skipStep"
                      >
                        Skip
                      </div>
                    </template>

                    <AppButton v-if="currentStep.step > 1" class="step-button__prev mr-15" type="grey" @click="prevStep">
                      Previous
                    </AppButton>

                    <AppButton type="light-green" class="step-button" :class="currentStep.step === 5 ? 'active' : 'next'" @click="nextStep">
                      {{ currentStep.step === 5 ? "Activate" : "Next" }}
                    </AppButton>

                    <template v-if="$breakpoint.mdAndDown">
                      <div v-if="currentStep.step > 2 && currentStep.step !== 5" class="flex items-center h-full ml-16" @click="skipStep">
                        <i class="icon-arrow-back transform rotate-180 text-xxl text-blue-cl-100" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- COMING SOON -->
        <ComingSoonDesktop v-if="isComingSoon" />
      </div>
    </div>

    <!-- MOBILE CONTENT -->
    <template v-else>
      <div v-if="!isComingSoon" class="flex flex-col flex-grow bg-dark-200 rounded-t-15 overflow-y-auto custom-scrollbar">
        <AppTabs :tabs="tabs" shrink ref="tabs">
          <template v-slot="{ currentTab }">
            <!-- CONTENT TAB -->
            <div
              v-if="currentTab.componentName === 'ContentMobile'"
              class="flex flex-col flex-grow relative px-20 pb-30 pt-20 overflow-y-auto custom-scrollbar"
            >
              <keep-alive>
                <component ref="step" :is="currentStep.componentName" :bot-type="result.botParameters.botType" />
              </keep-alive>

              <!-- ACTIONS BUTTONS -->
              <div class="flex items-center flex-shrink-0 mt-auto" :class="currentStep.step === 1 ? 'justify-end' : 'justify-between'">
                <AppButton v-if="currentStep.step > 1" class="step-button__prev mr-15" type="grey" @click="prevStep">
                  {{ prevBtnTitle }}
                </AppButton>

                <AppButton
                  type="light-green"
                  class="step-button flex-shrink-0"
                  :class="currentStep.step === 5 ? 'active' : 'next'"
                  @click="nextStep"
                >
                  {{ nextBtnTitle }}
                </AppButton>

                <div
                  v-if="currentStep.step > 2 && currentStep.step !== 5"
                  class="flex items-center flex-shrink-0 h-full ml-16"
                  @click="skipStep"
                >
                  <i class="icon-arrow-back transform rotate-180 text-xxl text-blue-cl-100" />
                </div>
              </div>

              <!-- PROGRESS BAR -->
              <ProgressBar :data="createNewBotSteps" :current-step="currentStep" />
            </div>

            <!-- RESULT TAB -->
            <template v-if="currentTab.componentName === 'ResultMobile'">
              <BotResult slot="content" :data="result" />
            </template>
          </template>
        </AppTabs>
      </div>

      <!-- COMING SOON -->
      <div v-if="isComingSoon" class="w-full flex flex-col">
        <ComingSoonWithoutDesign />
      </div>
    </template>

    <!-- MODAL -->
    <AppModal v-model="isOpenModal" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Coming Soon!</h2>
          <div class="create-new-bot__modal-desc flex flex-col items-center justify-center text-center text-base mb-30">
            <!-- <p class="text-grey-cl-100 leading-xs">Your bot has been successfully created, to activate it make sure you implement</p> -->
            <p class="text-grey-cl-100 leading-xs">
              Great, you've gone all the way to creating a bot. This feature will be available soon and we hope you found the process easy.
              Send us your feedback if you have any comments.
            </p>
            <!-- <a href="/" class="underline text-white">webhooks in your trading view.</a> -->
          </div>
          <AppButton type="light-green" class="create-new-bot__modal-btn" @click="$router.push('/')">Close</AppButton>
        </div>
      </div>
    </AppModal>

    <!-- C O M I N G   S O O N   M O D A L   P O P - UP -->
    <AppModal v-model="comingsoonModalOpen" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">Create My Bot: Coming Soon</h2>
          <div class="comingsoon-popup__modal-desc flex flex-col items-center justify-center text-center text-base mb-30">
            <p class="text-grey-cl-100 leading-xs">
              Please enjoy playing with a live tour of the Bot Creation process. Here lies the powerful automation engline of UpBots. Please
              note: Activating Bots will only be possible in future releases
            </p>
          </div>

          <AppButton type="light-green" class="comingsoon-popup__modal-btn" @click="handleComingSoonModal">Continue</AppButton>
        </div>
      </div>
    </AppModal>

    <!-- MODAL -->
    <!-- <AppModal v-model="isOpenModal" persistent max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20">
        <div class="flex flex-col items-center">
          <h2 class="text-xxl text-white text-center mb-20">You rock!</h2>
          <div class="create-new-bot__modal-desc flex flex-col items-center justify-center text-center text-base mb-30">
            <p class="text-grey-cl-100 leading-xs">Your bot has been successfully created, to activate it make sure you implement</p>
            <a href="/" class="underline text-white">webhooks in your trading view.</a>
          </div>
          <AppButton type="light-green" class="create-new-bot__modal-btn" @click="$router.push('/')">Bot Webhooks</AppButton>
        </div>
      </div>
    </AppModal> -->
  </GeneralLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";
import { ComingSoon } from "@/core/mixins/coming-soon";

import GeneralLayout from "@/views/GeneralLayout.vue";
import ProgressBar from "@/components/create-new-bot/ProgressBar.vue";
import BotResult from "@/components/create-new-bot/BotResult.vue";
import BotParameters from "@/components/create-new-bot/BotParameters.vue";
import BotEntry from "@/components/create-new-bot/BotEntry.vue";
import AverageDown from "@/components/create-new-bot/AverageDown.vue";
import BotsExit from "@/components/create-new-bot/BotsExit.vue";
import AddBotsSafeties from "@/components/create-new-bot/AddBotsSafeties.vue";

@Component({
  name: "CreateNewBot",
  components: {
    GeneralLayout,
    ProgressBar,
    BotResult,
    BotParameters,
    BotEntry,
    AverageDown,
    BotsExit,
    AddBotsSafeties,
  },
  mixins: [ComingSoon],
})
export default class CreateNewBot extends Vue {
  /* REFS */
  $refs!: {
    step: HTMLFormElement;
    tabs: any;
  };

  /* DATA */
  isOpenModal: boolean = false;

  comingsoonModalOpen: boolean = true;

  prevBtnTitle: string = "1. Bot Parameters";
  nextBtnTitle: string = "2. Bot Entry";

  currentStep: any = { step: 1, label: "Bot Parameters", componentName: "BotParameters" };

  tabs: Tab[] = [
    { value: "Bot Parameters", componentName: "ContentMobile" },
    { value: "Summary", componentName: "ResultMobile" },
  ];

  createNewBotSteps: any[] = [
    { step: 1, label: "Bot Parameters", componentName: "BotParameters" },
    { step: 2, label: "Bot Entry", componentName: "BotEntry" },
    { step: 3, label: "Average Down", componentName: "AverageDown" },
    { step: 4, label: "Bot Exit", componentName: "BotsExit" },
    { step: 5, label: "Add Bot Safeties", componentName: "AddBotsSafeties" },
  ];

  result: any = {
    botParameters: {}, // step 1
    botEntry: {}, // step 2
    averageDown: {}, // step 3
    botsExit: {}, // step 4
    addBotsSafeties: {}, // step 5
  };

  /* WATCHERS */
  @Watch("$breakpoint.width", { immediate: true, deep: true })
  handleChangeWidth(val: any) {
    if (val < 768) {
      this.currentStep = { step: 1, label: "Bot Parameters", componentName: "BotParameters" };
    }
  }

  /* METHODS */

  // content prev step
  prevStep() {
    if (this.currentStep.step < 2) return;
    this.currentStep = this.createNewBotSteps.find((i: any) => {
      return i.step === this.currentStep.step - 1;
    });

    // only for width < 768px
    if (this.$breakpoint.width < 768) {
      this.changePrevBtnName();
      this.changeContentTabTitle();
    }
  }

  // content next step
  nextStep() {
    if (this.currentStep.step === 5) {
      this.isOpenModal = true;
    }

    const { stepData, stepName } = this.$refs.step;
    this.result[stepName] = stepData;
    if (this.currentStep.step > 4) return;

    this.currentStep = this.createNewBotSteps.find((i: any) => {
      return i.step === this.currentStep.step + 1;
    });

    // only for width < 768px
    if (this.$breakpoint.width < 768) {
      this.changeNextBtnName();
      this.changeContentTabTitle();
      this.changeResultTabTitle();
    }
  }

  // TODO Refactor
  // only for width < 768px
  changePrevBtnName() {
    if (this.currentStep.step === 1) {
      this.prevBtnTitle = "1. Bot Parameters";
      this.nextBtnTitle = "2. Bot Entry";
    } else if (this.currentStep.step === 2) {
      this.prevBtnTitle = `1. ${this.createNewBotSteps[0].label}`;
      this.nextBtnTitle = `3. ${this.createNewBotSteps[2].label}`;
    } else if (this.currentStep.step === 3) {
      this.prevBtnTitle = `2. ${this.createNewBotSteps[1].label}`;
      this.nextBtnTitle = `4. ${this.createNewBotSteps[3].label}`;
    } else if (this.currentStep.step === 4) {
      this.prevBtnTitle = `3. ${this.createNewBotSteps[2].label}`;
      this.nextBtnTitle = `5. ${this.createNewBotSteps[4].label}`;
    } else if (this.currentStep.step === 5) {
      this.prevBtnTitle = `4. ${this.createNewBotSteps[3].label}`;
    }
  }

  // only for width < 768px
  changeNextBtnName() {
    if (this.currentStep.step === 1) {
      this.prevBtnTitle = "1. Bot Parameters";
      this.nextBtnTitle = "2. Bot Entry";
    } else if (this.currentStep.step === 2) {
      this.prevBtnTitle = `1. ${this.createNewBotSteps[0].label}`;
      this.nextBtnTitle = `3. ${this.createNewBotSteps[2].label}`;
    } else if (this.currentStep.step === 3) {
      this.prevBtnTitle = `2. ${this.createNewBotSteps[1].label}`;
      this.nextBtnTitle = `4. ${this.createNewBotSteps[3].label}`;
    } else if (this.currentStep.step === 4) {
      this.prevBtnTitle = `3. ${this.createNewBotSteps[2].label}`;
      this.nextBtnTitle = `5. ${this.createNewBotSteps[4].label}`;
    } else if (this.currentStep.step === 5) {
      this.prevBtnTitle = `4. ${this.createNewBotSteps[3].label}`;
      this.nextBtnTitle = "Activate";
    }
  }

  // change content tab title (only for width < 768px)
  changeContentTabTitle() {
    this.$refs.tabs.currentTab.value = this.currentStep.label;
  }

  // change result tab title (only for width < 768px)
  changeResultTabTitle() {
    if (this.result.botParameters.botName) {
      this.$refs.tabs.tabs[1].value = this.result.botParameters.botName;
    } else {
      this.$refs.tabs.tabs[1].value = "Summary";
    }
  }

  // skip content step
  skipStep() {
    this.nextStep();
  }

  handleComingSoonModal() {
    this.comingsoonModalOpen = !this.comingsoonModalOpen;
  }
}
</script>

<style lang="scss" scoped>
.step-button {
  &__prev {
    min-width: 150px;
  }
  &.next {
    min-width: 150px;
  }
  &.active {
    min-width: 210px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    &__prev {
      min-width: 120px;
    }
    &.next {
      min-width: 120px;
    }
    &.active {
      min-width: 120px;
    }
  }

  @media (max-width: 767px) {
    &__prev {
      max-width: 150px;
      @apply min-w-auto w-full;
    }
    &.next {
      min-width: 130px;
    }
    &.active {
      min-width: 150px;
    }
  }
}

.bot-result {
  &__inner {
    max-width: 255px;
    min-height: 694px;
    @media (min-width: 1440px) {
      max-width: 500px;
    }
    @media (max-width: 1024px) {
      min-height: 562px;
    }
  }
}

.bot-content {
  &__inner {
    min-height: 694px;
    @media (max-width: 1024px) {
      min-height: 562px;
    }
  }
}

.comingsoon_popup {
  &__modal-desc {
    max-width: 330px;
  }
  &__modal-btn {
    min-width: 240px;
  }
}

.create-new-bot {
  &__content {
    height: calc(100% - 58px);
  }
  &__modal-desc {
    max-width: 330px;
  }
  &__modal-btn {
    min-width: 240px;
  }
}

.progress-bar-mobile {
  bottom: 60px;
}
</style>
