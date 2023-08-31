<template>
  <div class="flex flex-col flex-shrink-0 mb-30 md:mb-0">
    <!-- TITLE -->
    <!-- <h4 class="text-sm leading-xs text-grey-cl-100 mb-30">
      Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based
      price methods while optimizing your automated trading strategies.
    </h4> -->

    <!-- ROW -->
    <div class="flex items-center mb-30 xl:mb-20">
      <p class="leading-md text-white mr-24">TradingView Exit Alert</p>
      <AppSwitcher v-model="switcher" active-text="On" inactive-text="Off" />
    </div>

    <!-- ROW -->
    <div class="lg:max-w-240 w-full mb-30">
      <h3 class="leading-md text-white mb-20">Trigger</h3>
      <p class="text-sm leading-md text-grey-cl-400">{{ stepData.trigger }}</p>
    </div>

    <!-- ROW -->
    <div class="flex flex-col lg:flex-row md:mb-40">
      <!-- TARGET COLUMN -->
      <div class="flex flex-col lg:mr-120 lg:max-w-200 w-full mb-35 mb:mb-50 lg:mb-0">
        <div class="flex items-center">
          <h3 class="leading-md text-white mr-10">Target</h3>
        </div>
        <div v-if="stepData.target.length" class="flex flex-col mt-10">
          <div class="flex items-center mb-10 last:mb-0" v-for="(item, index) in stepData.target" :key="index">
            <p class="text-grey-cl-100 text-xs leading-md mr-4">{{ index + 1 }}.</p>
            <div class="flex">
              <div class="max-w-47 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item.limit.label ? item.limit.label : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="max-w-47 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item.targetType.label ? item.targetType.label : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="max-w-47 truncate flex-shrink-0 max-w-48 text-grey-cl-100 text-xs leading-md truncate">
                {{ item.profit ? item.profit : "-" }}
              </div>
              <div><app-divider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">{{ item.percentageValue ? item.percentageValue : "-" }}%</div>
              <div class="flex ml-15 cursor-pointer" @click="removeOption('target', index)">
                <i class="icon-trash text-sm text-blue-cl-100" />
              </div>
            </div>
          </div>
        </div>

        <!-- TARGER FORM -->
        <div v-if="!stepData.target.length || targetOpen" class="flex flex-col mt-30">
          <div class="mb-15">
            <AppDropdownBasic v-model="targetForm.limit" :options="limitData" dark />
          </div>
          <div class="flex items-center mb-20">
            <p class="text-grey-cl-100 text-sm leading-xs mr-10">Target Type:</p>
            <AppDropdownBasic v-model="targetForm.targetType" :options="targetTypeData" dark />
          </div>
          <div class="flex flex-col mb-30">
            <p class="text-grey-cl-100 text-sm leading-xs mb-10">Profit %</p>
            <AppInput v-model="targetForm.profit" type="text" size="sm" />
          </div>
          <div class="flex flex-col max-w-200">
            <p class="text-grey-cl-100 text-sm leading-xs mb-20">% of the position</p>
            <AppItemsGroup v-model="targetForm.percentageValue" :items="targetPercentageData" />
          </div>

          <!-- ACTION BUTTONS -->
          <div class="flex items-center justify-between mt-25">
            <div class="flex items-center cursor-pointer" @click="saveOption('target')">
              <span class="icon-check text-blue-cl-100 text-md" />
              <span class="text-blue-cl-100 text-md leading-xs ml-6">Save</span>
            </div>
            <div class="text-grey-cl-200 text-sm leading-md cursor-pointer" @click="clearTargetData">
              <span class="border-b">Clear All</span>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center cursor-pointer mt-20" @click="targetOpen = true">
          <span class="icon-plus text-blue-cl-100 text-sm" />
          <span class="text-blue-cl-100 text-sm leading-xs ml-6">Add Target</span>
        </div>
      </div>

      <!-- STOP/LOSS COLUMN  -->
      <div class="flex flex-col lg:mr-120 lg:max-w-200 w-full">
        <div class="flex items-center">
          <h3 class="leading-md text-white mr-10">Stop/Loss</h3>
        </div>
        <div v-if="stepData.stopLoss.length" class="flex flex-col mt-10">
          <div class="flex items-center mb-10 last:mb-0" v-for="(item, index) in stepData.stopLoss" :key="index">
            <p class="text-grey-cl-100 text-xs leading-md mr-4">{{ index + 1 }}.</p>
            <div class="flex">
              <div class="max-w-50 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item.stopLossValue.label ? item.stopLossValue.label : "-" }}
              </div>
              <div><AppDivider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="max-w-100 truncate flex-shrink-0 text-grey-cl-100 text-xs leading-md">
                {{ item.entryPrice ? item.entryPrice : "-" }}
              </div>
              <div><AppDivider class="bg-grey-cl-300 flex flex-shrink-0 mx-6" is-vertical /></div>
              <div class="flex-shrink-0 text-grey-cl-100 text-xs leading-md">{{ item.percentageValue ? item.percentageValue : "-" }}%</div>
              <div class="flex ml-15 cursor-pointer" @click="removeOption('stopLoss', index)">
                <i class="icon-trash text-sm text-blue-cl-100" />
              </div>
            </div>
          </div>
        </div>

        <!-- STOP/LOSS FORM -->
        <div v-if="!stepData.stopLoss.length || stopLossOpen" class="flex flex-col mt-30">
          <div class="flex items-center mb-15">
            <p class="text-grey-cl-100 text-sm leading-xs mr-10">Stop Type:</p>
            <AppDropdownBasic v-model="stopLossForm.stopLossValue" :options="stopLossData" dark />
          </div>

          <div class="flex flex-col mb-30">
            <p class="text-grey-cl-100 text-sm leading-xs mb-10">% below entry price</p>
            <AppInput v-model="stopLossForm.entryPrice" type="text" size="sm" />
          </div>

          <AppItemsGroup v-model="stopLossForm.percentageValue" :items="stopLossPercentageData" />

          <!-- ACTION BUTTONS -->
          <div class="flex items-center justify-between mt-25">
            <div class="flex items-center cursor-pointer" @click="saveOption('stopLoss')">
              <span class="icon-check text-blue-cl-100 text-md" />
              <span class="text-blue-cl-100 text-md leading-xs ml-6">Save</span>
            </div>
            <div class="text-grey-cl-200 text-sm leading-md cursor-pointer" @click="clearStopLossData">
              <span class="border-b">Clear All</span>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center cursor-pointer mt-20" @click="stopLossOpen = true">
          <span class="icon-plus text-blue-cl-100 text-sm" />
          <span class="text-blue-cl-100 text-sm leading-xs ml-6">Add Stop/Loss</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { defaultBotEntryTargetForm, defaultBotEntryStopLossForm } from "@/models/default-models";

@Component({ name: "BotsExit" })
export default class BotsExit extends Vue {
  /* DATA */
  stepName: string = "botsExit";

  switcher: boolean = false;

  stepData: any = {
    target: [],
    stopLoss: [],
    trigger: "TradingView",
  };

  /* Target form */
  targetForm = defaultBotEntryTargetForm();
  stopLossForm = defaultBotEntryStopLossForm();

  limitData: GroupItems[] = [
    { value: "limit", label: "Limit" },
    { value: "second", label: "Second" },
  ];

  targetTypeData: GroupItems[] = [
    { value: "takeProfit", label: "Take profit" },
    { value: "second", label: "Secont" },
  ];

  targetPercentageData: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];

  /* Stop Loss data */
  stopLossData: GroupItems[] = [
    { value: "stopLoss", label: "Stop Loss" },
    { value: "second", label: "Second" },
  ];

  stopLossPercentageData: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];

  targetOpen: boolean = false;
  stopLossOpen: boolean = false;

  /* METHODS */

  /* save (target or stop/loss) item */
  saveOption(key: string) {
    const obj = `${key}Form`;

    (this as any)[`${key}Open`] = false;
    (this as any).stepData[key].push((this as any)[obj]);

    key === "target" ? this.clearTargetData() : this.clearStopLossData();
  }

  clearTargetData() {
    this.targetForm = defaultBotEntryTargetForm();
  }

  clearStopLossData() {
    this.stopLossForm = defaultBotEntryStopLossForm();
  }

  /* remove (target or stop/loss) item */
  removeOption(key: any, index: any) {
    this.stepData[key].splice(index, 1);
  }
}
</script>

<style lang="scss" scoped>
.bots-exit {
  &__buttons-group {
    max-width: 530px;
  }
}
</style>
