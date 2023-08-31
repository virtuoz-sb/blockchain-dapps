<template>
  <div class="container px-40 py-20">
    <h2 class="text-xxxl2 text-white font-bold text-center">UI</h2>
    <h3 class="text-xxxl1 text-white mb-10">Gradients</h3>
    <div class="grid grid-cols-6 col-gap-24 row-gap-24">
      <div class="h-60 flex items-center justify-center" v-for="(gradient, index) in gradients" :key="index" :class="gradient">
        {{ gradient }}
      </div>
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxxl1 text-white mt-10">Colors</h3>
    <div class="grid grid-cols-6 col-gap-24 row-gap-24">
      <div class="h-60 flex flex-col items-center justify-center" v-for="(color, index) in colors" :key="index" :class="[`bg-${color}`]">
        <span>{{ `text-${color}` }}</span>
        /
        <span>{{ `bg-${color}` }}</span>
      </div>
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxxl1 text-white mt-10">Icons</h3>
    <div class="grid grid-cols-6 col-gap-24 row-gap-24">
      <div class="h-60 flex flex-col items-center justify-center" v-for="icon in icons" :key="icon.name">
        <span :class="`icon-${icon.properties.name}`" class="text-white mb-10"></span>
        <code class="text-xs">{{ `icon-${icon.properties.name}` }}</code>
      </div>
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h2 class="text-xxxl2 text-white font-bold text-center mb-40">Shared components</h2>

    <h3 class="text-xxl text-white mb-15">Accordion</h3>
    <AppAccordion>
      <AppAccordionItem
        v-for="(item, index) in accordionItems"
        :key="index"
        :index="index"
        collapse-icon="icon-arrow-expand text-grey-cl-920"
        class=""
        custom-class="py-18 px-20 cursor-pointer"
      >
        <template v-slot:title>
          <p class="w-full text-white text-sm pr-20">{{ item.title }}</p>
        </template>
        <p class="text-sm leading-xs text-grey-cl-920 mt-20">{{ item.description }}</p>
      </AppAccordionItem>
    </AppAccordion>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Button blue filled</h3>
    <div class="flex items-center">
      <AppButton type="light-green" size="xxs">Blue filled</AppButton>
      <AppButton type="light-green" size="xs">Blue filled</AppButton>
      <AppButton type="light-green" size="sm">Blue filled</AppButton>
      <AppButton type="light-green" size="md">Blue filled</AppButton>
      <AppButton type="light-green">Blue filled</AppButton>
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Button blue bordered</h3>
    <div class="flex items-center">
      <AppButton type="blue-bordered" size="xxs" class="text-sm leading-sm">Start a Trade</AppButton>
      <AppButton type="blue-bordered" size="xs">Start a Trade</AppButton>
      <AppButton type="blue-bordered" size="sm">Start a Trade</AppButton>
      <AppButton type="blue-bordered" size="md">Start a Trade</AppButton>
      <AppButton type="blue-bordered" class="text-md leading-xs">Blue filled</AppButton>
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Button yellow</h3>
    <div class="flex items-center">
      <AppButton type="yellow" size="xxs">Yellow</AppButton>
      <AppButton type="yellow" size="xs">Yellow</AppButton>
      <AppButton type="yellow" size="sm">Yellow</AppButton>
      <AppButton type="yellow" size="md">Yellow</AppButton>
      <AppButton type="yellow">Yellow</AppButton>
    </div>
    <AppDivider class="bg-grey-100 my-20" />
    <AppButton type="primary" icon="icon-plus" rounded="full" class="w-70 h-70" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Tabs Switcher</h3>
    <AppButtonsGroup v-model="buttonsGroupSelected" :items="buttonsGroupData" customClasses="max-w-75 text-grey-cl-200 py-7 px-5" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">App Buttons Group Filled</h3>
    <AppButtonsGroup v-model="buttonsGroupSelected" :items="buttonsGroupData" type="filled" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Checkbox</h3>
    <AppCheckbox v-model="isChecked">checkbox</AppCheckbox>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Confirm Modal</h3>
    <AppConfirmModal
      ref="conformModal"
      title="Delete Your Bot?"
      subtitle="Are you sure you want to delete this bot?"
      confirm-button="Delete"
    >
    </AppConfirmModal>
    <AppButton type="primary" size="sm" @click="conformModal">Open Confirm Modal</AppButton>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Light</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicValue" :options="dropdownBasicData" />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Dark</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicValue" :options="dropdownBasicData" dark />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown List</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicValue" :options="dropdownBasicData" list item-size="xs" />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Dots</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicValue" :options="dropdownBasicData" dots />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Disabled</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicValue" :options="dropdownBasicData" disabled />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Img</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicImgValue" :options="dropdownBasicImgData" />
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Disabled Option</h3>
    <div class="flex items-start">
      <AppDropdownBasic v-model="dropdownBasicImgValue" :options="dropdownBasicImgData" :disabled-options="dropdownDisabledValues" />
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Multiple</h3>
    <div class="flex items-start">
      <AppDropdownMultiple
        v-model="dropdonwMultipleValue"
        :options="dropdonwMultipleData"
        key-label="name"
        placeholder="Select your wallet"
        dark
      />
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Dropdown Multiple Disabled Options</h3>
    <div class="flex items-start">
      <AppDropdownMultiple
        v-model="dropdonwMultipleValue"
        :options="dropdonwMultipleData"
        :disabled-options="dropdonwMultipleDisabled"
        disabledKeyName="id"
        key-label="name"
        dark
        placeholder="Select your wallet"
      />
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Inputs Default</h3>
    <AppInput v-model="inputValue" name="Email" rules="email|required" placeholder="Add value" type="text" size="sm" />
    <AppDivider class="bg-grey-cl-300 my-20" />
    <AppInput v-model="inputValue" name="Email" rules="email|required" placeholder="Add value" type="text" />
    <AppDivider class="bg-grey-100 my-20" />
    <AppInput class="mb-6" number v-model="inputNumbers.integer" type="number" min="0" />
    <AppDivider class="bg-grey-cl-300 my-20" />
    <AppInput class="mb-6" number v-model="inputNumbers.hundredFloat" type="number" />
    <AppDivider class="bg-grey-cl-300 my-20" />
    <AppInput class="mb-6" number v-model="inputNumbers.thouthendFloat" type="number" />
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Input Number</h3>
    <AppInput-number class="mb-6" v-model="inputNumberValue" />
    <AppInput-number class="mb-6" arrow v-model="inputNumberValue" />
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Tabs Group</h3>
    <AppItemsGroup v-model="toggledValue" :items="toggleValues" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Link</h3>
    <div class="flex items-center">
      <AppLink to="/">
        <span class="link__text text-blue-cl-100 leading-1">Link</span>
      </AppLink>
      <div class="px-40" />
      <AppLink icon="icon-expand" class="flex items-center" to="/12312">
        <span class="link__text text-blue-cl-100 leading-1">Link</span>
      </AppLink>
    </div>

    <AppDivider class="bg-grey-cl-300 my-20" />

    <h3 class="text-xxl text-white mb-15">Modal</h3>
    <AppModal v-model="editModalData" max-width="500px">
      <div class="edit-modal__wrap relative flex flex-col pt-60 pb-40 px-20 md:px-75">
        <h2 class="font-raleway text-white text-xxl text-center mb-45">Modal</h2>
      </div>
    </AppModal>
    <AppButton type="primary" size="sm" @click="editModalData = true">Open Modal</AppButton>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Notification (check created hook)</h3>
    <AppNotifications />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">App Progress</h3>
    <AppProgress class="max-w-full h-3 flex mr-0 md:mr-4" :value="100" custom-line-class="h-full gradient-6" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Radio Buttons</h3>
    <div class="flex items-center">
      <AppRadio v-model="radioSelected" label="By Default" class="mr-20" />
      <AppRadio v-model="radioSelected" label="Custom" input-value="20" />
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Range Sliders</h3>
    <div class="range-slider-test w-full p-20 mb-20">
      <span class="text-white">{{ rangeMultipleValue }}</span>
      <AppRangeSlider :options="{ min: 20, max: 200 }" v-model="rangeMultipleValue" labels="%" />
    </div>
    <div class="range-slider-test w-full p-20 mb-20">
      <span class="text-white">{{ rangeSingleValue }}</span>
      <AppRangeSlider :options="{ min: 1, max: 100 }" v-model="rangeSingleValue" labels="x" />
    </div>

    <div class="range-slider-test w-full p-20">
      <p class="text-white mb-10">
        With custom interval. More options
        <a class="text-blue-cl-400" href="https://nightcatsama.github.io/vue-slider-component/#/api/props" target="_black">here</a>
      </p>
      <span class="text-white">{{ rangeSingleValueFloat }}</span>
      <AppRangeSlider :options="{ min: 0, max: 1, interval: 0.05 }" v-model="rangeSingleValueFloat" labels="x" />
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Rating</h3>
    <AppRating :value="1" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Select</h3>
    <AppSelect v-model="selectedSelectOption" :options="selectData" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Switchers</h3>
    <AppSwitcher v-model="switcher" active-text="On" inactive-text="Off" />
    <AppDivider class="bg-grey-100 my-20" />
    <AppSwitcher v-model="switcher" type="secondary" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Tabs Component is</h3>
    <AppTabs :tabs="tabs" shrink>
      <template v-slot="{ currentTab }">
        <component :is="currentTab.componentName" />
      </template>
    </AppTabs>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Tabs default</h3>
    <AppTabs :tabs="tabs2">
      <template v-slot="{ currentTab }">
        <div v-if="currentTab.value === 'First'" class="text-white">content1</div>
        <div v-if="currentTab.value === 'Second'" class="text-grey-cl-100">content2</div>
        <div v-if="currentTab.value === 'Third'" class="text-grey-cl-200">content3</div>
      </template>
    </AppTabs>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Tag</h3>
    <AppTag type="blue-filled" class="py-7 px-25 text-center">Recommended for experts</AppTag>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Textarea</h3>
    <AppTextarea v-model="textarea" custom-class="textarea w-full h-80" class="textarea__wrap" />

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Card</h3>
    <div class="flex flex-col p-60">
      <Card class="flex flex-col gradient-2 shadow-110" header-classes="flex items-end justify-between">
        <template slot="header-left">
          <span class="leading-xxs text-white">
            Portfolio distribution Chart Portfolio distribution Chart Portfolio distribution Chart
          </span>
        </template>
        <template slot="header-right">
          <i class="text-sm icon-edit text-blue-cl-100 cursor-pointer" />
          <span class="text-sm leading-xs text-blue-cl-100 pl-8 cursor-pointer">Edit</span>
        </template>
        <div slot="content">Test</div>
      </Card>

      <AppDivider class="bg-grey-100 my-20" />

      <Card class="flex flex-col gradient-2 shadow-110" header-classes="flex items-end justify-between">
        <template slot="header-left">
          <span class="leading-xxs text-white">
            Portfolio distribution Chart Portfolio distribution Chart Portfolio distribution Chart
          </span>
        </template>
        <template slot="header-right">
          <span class="text-sm leading-xs text-blue-cl-400">EUR, BTC</span>
        </template>
        <div slot="content">Test</div>
      </Card>
    </div>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Lists</h3>
    <div class="flex">
      <div class="flex flex-col">
        <div v-for="(number, index) in listOfNumber" :key="index">
          <span class="text-shadow-1 text-blue-cl-400">{{ number }}</span>
        </div>
      </div>
      <div class="flex flex-col">
        <div v-for="(number, index) in listOfNumber" :key="index">
          <span class="text-grey-cl-100 text-sm leadning-xs ml-10">List item</span>
        </div>
      </div>
    </div>
    <AppDivider class="bg-grey-100 my-20" />
    <ul class="flex flex-col">
      <li v-for="(number, index) in listOfNumber" :key="index" class="point-gradient text-grey-cl-100 text-sm leadning-xs">{{ number }}</li>
    </ul>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">App Loader</h3>
    <AppLoader ref="loader" v-model="loader" />
    <AppButton type="primary" size="sm" @click="isLoader" class="mt-10">Is Loading</AppButton>

    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Breakpoints</h3>
    <div class="text-white mt-10">
      <p>$breakpoint:</p>
      <p class="text-white">name: {{ $breakpoint.name }}</p>
      <p class="text-white">xsOnly: {{ $breakpoint.xsOnly }}</p>
      <p class="text-white">mdAndDown: {{ $breakpoint.mdAndDown }}</p>
      <p class="text-white">width: {{ $breakpoint.width }}</p>
    </div>
    <AppDivider class="bg-grey-100 my-20" />

    <h3 class="text-xxl text-white mb-15">Lazy Image</h3>

    <ImageItem
      :src="require('@/assets/images/user-profile.png')"
      :size="{ width: 300, height: 300 }"
      img-class="max-w-full"
      :alt="'upwork img mobile'"
    />

    <h3 class="text-xxl text-white mt-15 mb-15">Filters</h3>

    <div class="text-white">
      <div><span class="mr-10">ternary expression:</span> {{ filterValue1 ? 1 : "4" | fixed }}</div>
      <div><span class="mr-10">ternary expression:</span> {{ filterValue1 ? 1 : null | fixed(4, "N/A") }}</div>
      <div><span class="mr-10">filterValue1:</span> {{ filterValue1 | fixed }}</div>
      <div><span class="mr-10">filterValue2:</span> {{ filterValue2 | fixed(0, 0) }}</div>
      <div><span class="mr-10">filterValue3:</span> {{ filterValue3 | fixed }}</div>
      <div><span class="mr-10">filterValue4:</span> {{ filterValue4 | fixed }}</div>
      <div><span class="mr-10">filterValue5:</span> {{ filterValue5 | fixed }}</div>
      <div><span class="mr-10">filterValue6:</span> {{ filterValue6 | fixed }}</div>
      <div><span class="mr-10">filterValue7:</span> {{ filterValue7 | fixed }}</div>
      <div><span class="mr-10">filterValue8:</span> {{ filterValue8 | fixed }}</div>
      <div><span class="mr-10">filterValue9:</span> {{ filterValue9 | fixed }}</div>
    </div>

    <div class="h-1/2"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { GroupItems, Tab } from "@/models/interfaces";

// @ts-ignore
import { icons } from "@/assets/fonts/icomoon/selection.json";

@Component({ name: "Playground" })
export default class Playground extends Vue {
  /* REFS */
  $refs!: {
    conformModal: Vue & {
      show: () => Promise<void>;
    };
    loader: any;
  };

  /* DATA */
  filterValue1: any = null;
  filterValue2: any = false;
  filterValue3: any = true;
  filterValue4: any = 0;
  filterValue5: any = 1231242;
  filterValue6: any = 123.1242;
  filterValue7: any = "123.1242";
  filterValue8: any = "123,1242";
  filterValue9: any = "123wfwf323";

  gradients: string[] = ["gradient-1", "gradient-2", "gradient-3", "gradient-4", "gradient-5", "gradient-6", "gradient-7"];

  colors: string[] = [
    "grey-cl-100",
    "grey-cl-200",
    "grey-cl-300",
    "grey-cl-400",
    "grey-cl-500",
    "grey-cl-600",
    "grey-cl-700",
    "grey-cl-800",
    "grey-cl-900",
    "grey-cl-910",
    "grey-cl-920",
    "dark-cl-100",
    "dark-cl-200",
    "dark-cl-300",
    "dark-cl-400",
    "dark-cl-500",
    "blue-cl-100",
    "blue-cl-200",
    "blue-cl-300",
    "blue-cl-400",
    "blue-cl-500",
    "blue-cl-600",
    "blue-cl-700",
    "blue-cl-800",
    "red-cl-100",
    "red-cl-100",
    "green-cl-200",
    "green-cl-200",
  ];

  icons: any[] = icons;

  accordionItems = [
    {
      open: false,
      title: "How does the bot work?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
    {
      open: false,
      title: "How much capital do i need to use the Bot?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
    {
      open: false,
      title: "How do I set up the bot?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
    {
      open: false,
      title: "How can I trust that the bot will always perform at it’s optimal level?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
  ];

  buttonsGroupSelected: string = "1";
  buttonsGroupData: GroupItems[] = [
    { value: "1", label: "Advanced" },
    { value: "2", label: "Simple" },
  ];

  isChecked: boolean = false;

  loading: boolean = false;

  selectedOption = { value: "1", label: "One" };
  selectedOptionArray = ["Dropdown", "Dropdown item"];
  dropdownData: GroupItems[] = [
    { value: "1", label: "Dropdown" },
    { value: "2", label: "Dropdown item" },
    { value: "3", label: "Dropdown outem" },
    { value: "4", label: "Four" },
    { value: "5", label: "Five" },
    { value: "6", label: "Six" },
    { value: "7", label: "Seven" },
    { value: "8", label: "Eight" },
  ];

  dropdownBasicValue: any = { value: 1, label: "STABLE COINS", headerLabel: true };
  dropdownBasicData: any = [
    { value: 1, label: "STABLE COINS", headerLabel: true },
    { value: 2, label: "USD" },
    { value: 3, label: "EUR" },
    { value: 4, label: "GBP" },
  ];

  dropdownBasicImgValue: any = { value: 1, label: "Binance", img: require("@/assets/images/binance.svg") };
  dropdownBasicImgData: any = [
    { value: 1, label: "Binance", img: require("@/assets/images/binance.svg") },
    { value: 2, label: "Bitfinex", img: require("@/assets/images/bitfinex.svg") },
    { value: 3, label: "Kucoin", img: require("@/assets/images/kucoin.svg") },
  ];
  dropdownDisabledValues: any = [2, 3];

  dropdonwMultipleValue: any[] = ["bitmextest", "bitcoin"];
  dropdonwMultipleData: any = [
    { id: 1, exchange: "bitmextest", name: "bitmextest" },
    { id: 2, exchange: "bitcoin", name: "bitcoin" },
  ];
  dropdonwMultipleDisabled: any = [2];

  inputValue: string = "test";

  toggledValue: string = "50";
  toggleValues: GroupItems[] = [
    { value: "25", label: "25%" },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
  ];

  editModalData: any = null;

  radioSelected: string = "20";

  selectedSelectOption = { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" };
  selectData: any[] = [
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/binance.svg"), label: "Binance", alt: "binance" },
    { img: require("@/assets/images/bitfinex.svg"), label: "BitFinex", alt: "binance" },
    { img: require("@/assets/images/kucoin.svg"), label: "Kucoin", alt: "binance" },
  ];

  switcher: boolean = true;

  tabs: Tab[] = [
    { value: "Button", componentName: "AppButton" },
    { value: "Input", componentName: "AppInput" },
  ];

  tabs2: Tab[] = [{ value: "First" }, { value: "Second" }, { value: "Third" }];

  textarea: string = "";

  inputNumbers = {
    integer: 2,
    hundredFloat: 0.01,
    thouthendFloat: 0.001,
  };

  inputNumberValue: number = 2;

  rangeSingleValue: number = 30;
  rangeSingleValueFloat: number = 0.15;
  rangeMultipleValue: number[] = [30, 90];

  listOfNumber: string[] = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10."];

  loader: boolean = false;

  /* HOOKS */
  created() {
    this.$notify({ text: "Error", type: "error" });
    this.$notify({ text: "Warning", type: "warning" });
    this.$notify({ text: "Info", type: "info" });
    this.$notify({ text: "Success", type: "success" });
  }

  /* METHODS */
  conformModal() {
    this.$refs.conformModal.show().then(() => {
      this.loading = true;
    });
  }

  isLoader() {
    this.loader = !this.loader;
  }
}
</script>

<style lang="scss" scoped>
::v-deep .accordion-item {
  &:nth-child(odd) {
    @apply bg-dark-cl-300;
  }
}

.range-slider-test {
  background: linear-gradient(180deg, rgba(96, 102, 117, 0.15) 0%, rgba(96, 102, 117, 0) 100%), linear-gradient(0deg, #151619, #151619),
    #c4c4c4;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
}
</style>
