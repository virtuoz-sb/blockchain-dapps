<template>
  <AppAccordion class="overflow-y-auto custom-scrollbar pb-56">
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
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "FAQ" })
export default class FAQ extends Vue {
  /* DATA */
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
    {
      open: false,
      title: "How long should i use the bot?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
    {
      open: false,
      title: "Is this suitable for total newbies who have no idea about crypto investments but want to earn a steady income every month?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
    {
      open: false,
      title: "Can you tell me about the bot in a nutshell?",
      description:
        "Use our powerful backtesting engines to minimize your exposure from unnecessary risk. Choose between close price or order book based price methods while optimizing your automated trading strategies. Monitor in real-time how your crypto trading bots are performing, risk-free, with paper trading. Simulated paper trading helps traders master our automated trading platform and is available for the majority of integrated exchanges.",
    },
  ];
}
</script>

<style lang="scss" scoped>
::v-deep .accordion-item {
  &:nth-child(odd) {
    @apply bg-dark-cl-300;
  }
}
</style>
