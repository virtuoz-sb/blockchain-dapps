<template>
  <div class="new-order md:h-full flex flex-col overflow-y-auto custom-scrollbar">
    <!-- ACCOUNTS -->
    <div class="flex items-center flex-shrink-0 mt-20 px-20 mb-10">
      <template v-if="hasAccountKeys">
        <div class="text-iceberg text-sm leading-xs mr-12 md:mr-8">Account:</div>
        <AppDropdownBasic
          :value="exchange"
          :options="getKeyNames"
          key-value="id"
          key-label="displayName"
          :disabled-options="disabledExchanges"
          disabled-key-name="exchange"
          size="sm"
          dark
          truncate
          @change="handleAccountSelection"
        />
      </template>

      <router-link v-else to="/keys" class="w-full">
        <AppButton type="light-green" class="w-full">Add a Binance account</AppButton>
      </router-link>
    </div>

    <!-- PAIR SELECTION -->
    <PairSelection
      v-model="selectedPair"
      :exchange="exchange && exchange.exchange"
      class="flex flex-col mb-10"
      @change="handlePairSelection()"
    />

    <!-- OPERATION TYPES -->
    <div class="px-20 mb-25">
      <AppButtonsGroup
        v-model="selectedOperationType"
        :items="operationTypes"
        custom-classes="text-sm leading-md text-grey-cl-200 py-7 px-5"
        @change="resetOrderOperations"
      />
    </div>

    <!-- AVAILABLE  BALANCE -->
    <div class="flex items-center flex-shrink-0 px-20 mb-25">
      <span class="text-iceberg text-sm leading-xs mr-8">Available:</span>
      <span class="text-bright-turquoise text-sm leading-xs">{{ baseAvailable | fixed(8, "N/A") }} {{ orderCostCurrency }}</span>
    </div>

    <!-- NEW ORDER SIMPLE  -->
    <NewOrderSimple
      v-if="tradingType === 'basic'"
      ref="newOrderSimple"
      class="pb-10 px-20 md:flex md:flex-col md:h-full md:overflow-y-auto custom-scrollbar"
      :exchange="exchange && exchange.exchange"
      :pair="selectedPair"
      :base-available="baseAvailable"
      :price-correlation-pair="getCurrentQuotedPrice"
      :operation-type="selectedOperationType"
      :allow-create.sync="allowBasicOrderCreate"
      :lastOrderPrice="getLastOrderBookPrice"
      :is-price="isPrice"
      :is-get-base-available-done="isGetBaseAvailableDone"
    />

    <!-- NEW ORDER ADVANCED DESKTOP -->
    <div
      v-if="tradingType === 'advanced'"
      :class="{ 'cursor-not-allowed': !isValidKey }"
      class="hidden md:flex md:flex-col md:h-full overflow-y-auto custom-scrollbar"
    >
      <div :class="{ 'pointer-events-none': !isValidKey }">
        <!-- ENTRY -->
        <Entry
          ref="entry"
          :key="selectedOperationType"
          :pair="selectedPair"
          :exchange="exchange && exchange.exchange"
          :base-available="baseAvailable"
          :price-correlation-pair="getCurrentQuotedPrice"
          :operations="orderOperations"
          :operation-type="selectedOperationType"
          @save="saveOperation"
          @close="editIndex = null"
        >
          <div slot="recap" v-if="orderOperations.entry.length" class="flex-col bg-dark-cl-300 mt-20">
            <EntryRecap
              v-for="(operation, index) of orderOperations.entry"
              :key="index"
              :data="operation"
              :index="index"
              @edit="editEntry(index)"
              @remove="handleRemove({ index, type: 'entry' })"
            />
          </div>
        </Entry>

        <!-- TARGET -->
        <Target
          ref="target"
          :pair="selectedPair"
          :exchange="exchange && exchange.exchange"
          :base-available="baseAvailable"
          :price-correlation-pair="getCurrentQuotedPrice"
          :operations="orderOperations"
          :operation-type="selectedOperationType"
          :entries-total-quantity="entriesTotalQuantity"
          @save="saveOperation"
          @close="editIndex = null"
        >
          <div slot="recap" v-if="orderOperations.target.length" class="flex flex-col bg-dark-cl-300 mt-20">
            <TargetRecap
              v-for="(operation, index) of orderOperations.target"
              :key="index"
              :data="operation"
              :index="index"
              @edit="editTarget(index)"
              @remove="handleRemove({ index, type: 'target' })"
            />
          </div>
        </Target>

        <!-- STOP LOSS -->
        <StopLoss
          ref="stopLoss"
          :pair="selectedPair"
          :exchange="exchange && exchange.exchange"
          :price-correlation-pair="getCurrentQuotedPrice"
          :operations="orderOperations"
          :entries-total-quantity="entriesTotalQuantity"
          @save="saveOperation"
        >
          <div slot="recap" v-if="orderOperations.stopLoss" class="flex flex-col bg-dark-cl-300 mt-20">
            <StopLossRecap :data="orderOperations.stopLoss" @edit="editStopLoss" @remove="handleRemove({ type: 'stopLoss' })" />
          </div>
        </StopLoss>
      </div>
    </div>

    <!-- CREATE ORDER BUTTON -->
    <div class="flex flex-shrink-0 pb-20 px-20">
      <template v-if="isValidKey">
        <AppButton
          v-if="tradingType === 'basic'"
          type="light-green"
          class="w-full"
          :disabled="!baseAvailable"
          @click="createNewSimpleOrder"
        >
          <!--  :disabled="allowBasicOrderCreate" -->
          Create Order
        </AppButton>
        <AppButton v-else type="light-green" class="w-full" :disabled="!validateStartegyOrder" @click="createNewOrder">
          Create Order
        </AppButton>
      </template>

      <AppButton v-else type="red" class="w-full" disabled>{{ !exchange ? "Account is not selected" : "Invalid API key" }}</AppButton>
    </div>

    <!-- LAUCHING POPUP -->
    <LaunchingPopup ref="launchingPopup" />

    <!-- COMING SOON MODAL -->
    <AppModal v-model="isComingSoonModal" max-width="500px">
      <div class="relative flex flex-col pt-60 pb-40 px-20 md:px-85">
        <h2 class="font-raleway text-white text-xxl text-center mb-20">Coming Soon</h2>
        <p class="account-detect-modal__desc text-grey-cl-920 text-center mx-auto mb-20">
          Trading is the very core of UpBots. Here you will be able to trade via any wallet/exchange you have integrated. Specific entry
          points, trailing stop losses and multiple take profits and more...
        </p>
        <AppButton type="light-green" @click="isComingSoonModal = false">Close</AppButton>
      </div>
    </AppModal>

    <!-- CONFIRM ORDER MODAL -->
    <AppConfirmModal ref="confirmOrderModal" confirm-button="Create" :isDisabled="isDisabledConfirmOrder">
      <div class="flex flex-col">
        <h2 class="text-xxl1 font-semibold text-white border-b border-solid border-blue-cl-400 pb-20">
          My Order -
          <span class="uppercase" :class="`text-${sideStyle}`">{{ orderData && orderData.side }} {{ orderData && orderData.type }}</span>
        </h2>
        <div class="flex flex-col pt-30 px-60">
          <div class="grid grid-cols-2 col-gap-10 mb-15">
            <span class="text-grey-cl-920 text-left">Account:</span>
            <span class="text-left text-white">{{ exchange && exchange.name }}</span>
          </div>
          <div class="grid grid-cols-2 col-gap-10 mb-15">
            <span class="text-grey-cl-920 text-left">Pair:</span>
            <span class="text-left text-white">{{ selectedPair && selectedPair.name }}</span>
          </div>
          <div class="grid grid-cols-2 col-gap-10 mb-15">
            <span class="text-grey-cl-920 text-left">Price:</span>
            <span class="text-left text-white">{{ orderPrice }}</span>
          </div>
          <div v-if="orderData && orderData.type.toUpperCase() === 'LIMIT'" class="grid grid-cols-2 col-gap-10 mb-15">
            <span class="text-grey-cl-920 text-left">Amount:</span>
            <span class="text-left text-white">{{ orderData && orderData.quantity }}</span>
          </div>
          <div class="grid grid-cols-2 col-gap-10">
            <span class="text-grey-cl-920 text-left">Total:</span>
            <span class="text-left text-white">{{ orderData && orderData.totalValue }}</span>
          </div>
        </div>
      </div>
    </AppConfirmModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { orderOperationsDefault } from "@/models/default-models";
import { CreateStrategyOrderDto, mapEntries, mapStopLoss, mapTakeProfits } from "@/store/orders/types";
import { ExchangePairSettings } from "@/store/trade/types";
import { OrderOperations } from "../types/manul-trade.types";

const user = namespace("userModule");
const trade = namespace("tradeModule");
const orderBook = namespace("orderBookModule");
const order = namespace("orderModule");

import Entry from "@/components/manual-trade/orders/order-options/Entry.vue";
import Target from "@/components/manual-trade/orders/order-options/Target.vue";
import StopLoss from "@/components/manual-trade/orders/order-options/StopLoss.vue";
import NewOrderSimple from "@/components/manual-trade/orders/NewOrderSimple.vue";
import PairSelection from "@/components/manual-trade/pair-selection/PairSelection.vue";
import LaunchingPopup from "@/components/manual-trade/modals/LaunchingPopup.vue";
import EntryRecap from "@/components/manual-trade/orders/order-options/operations/EntryRecap.vue";
import TargetRecap from "@/components/manual-trade/orders/order-options/operations/TargetRecap.vue";
import StopLossRecap from "@/components/manual-trade/orders/order-options/operations/StopLossRecap.vue";

@Component({
  name: "NewOrder",
  components: {
    Entry,
    Target,
    StopLoss,
    NewOrderSimple,
    PairSelection,
    LaunchingPopup,
    EntryRecap,
    TargetRecap,
    StopLossRecap,
  },
})
export default class NewOrder extends Vue {
  /* VUEX */
  @user.State accounts: any;
  @user.Getter getKeyNamesWithExchange: any;
  @user.Getter disabledExchanges: any;
  @trade.State exchange: any;
  @trade.State isPrice: boolean;
  @trade.State selectedCurrencyPair: ExchangePairSettings;
  @trade.Getter availablePairs: any;
  @trade.Mutation setExchange: any;
  @trade.Mutation selectPair: any;
  @trade.Getter getAvailablePairs: any;
  @trade.Action fetchTradesFormats: any;
  @trade.Getter getCurrentQuotedPrice: number; // previously called priceCorrelationPair
  @trade.Action fetchCurrentPriceAction: any;
  @order.Action changeUnreadOrders: any;
  @orderBook.Getter getLastOrderBookPrice: any;

  createNewStrategyOrderAction!: (payload: CreateStrategyOrderDto) => any;

  /* PROPS */
  @Prop({ required: true }) tradingType: string;
  @Prop({ required: true }) currentPair: ExchangePairSettings; // keep current pair selection in parrent component

  /* REFS */
  $refs!: {
    newOrderSimple: Vue & {
      validate: any;
      getFormData: any;
      validateFields: any;
    };
    launchingPopup: Vue & {
      show: (a: CreateStrategyOrderDto, b: any, c: any) => Promise<void>;
    };
    confirmOrderModal: Vue & {
      show: () => Promise<void>;
    };
    entry: Vue & { editEntry: any };
    target: Vue & { editTarget: any };
    stopLoss: Vue & { editStopLoss: any };
  };

  /* DATA */
  orderOperations: OrderOperations = {
    entry: [],
    target: [],
    stopLoss: null,
  };

  allowBasicOrderCreate: boolean = false;
  selectedOperationType: string = "buy";
  baseAvailable: number = 0.0;
  editIndex: number = null;
  selectedAccountDist: any = null;
  isValidKey: boolean = false;
  isComingSoonModal: boolean = false;
  orderData: any = null;
  isDisabledConfirmOrder: boolean = false;
  //**Sawi**/
  isGetBaseAvailableDone: boolean = false;

  /* COMPUTED */
  get operationTypes() {
    return [
      { label: `Buy ${this.selectedPair.baseCurrency}`, value: "buy" },
      { label: `Sell ${this.selectedPair.baseCurrency}`, value: "sell" },
    ];
  }

  get entriesTotalQuantity() {
    if (this.orderOperations.entry.length) {
      return this.orderOperations.entry.reduce((acc: number, cur: any) => {
        return acc + cur.amount;
      }, 0);
    }

    return "N/A";
  }

  get selectedPair(): ExchangePairSettings {
    return this.selectedCurrencyPair;
  }

  set selectedPair(value: ExchangePairSettings) {
    this.$emit("update:currentPair", value);
    this.selectPair(value);
  }

  get validateStartegyOrder() {
    return (
      this.orderOperations.entry.length > 0 &&
      this.exchange &&
      this.selectedCurrencyPair &&
      this.orderOperations.target.length > 0 &&
      this.orderOperations.stopLoss
    );
  }

  get orderCostCurrency(): string {
    if (this.selectedPair.inverse && this.selectedPair.perpetualContract) {
      return this.selectedPair.baseCurrency;
    }
    return this.selectedOperationType === "buy" ? this.selectedPair.quoteCurrency : this.selectedPair.baseCurrency;
  }

  get hasAccountKeys() {
    if (!this.getKeyNamesWithExchange.length) return false;
    return true;
  }

  get hasBinanceKey() {
    if (!this.getKeyNamesWithExchange.length) return false;

    const exchanges = this.getKeyNamesWithExchange.map((e: any) => e.exchange);
    return exchanges.includes("binance");
  }

  get sideStyle() {
    return this.orderData && this.orderData.side === "BUY" ? "green-cl-100" : "red-cl-100";
  }

  get orderPrice() {
    return this.orderData && this.orderData.type.toUpperCase() === "LIMIT" ? this.orderData.price : "Market";
  }

  get getKeyNames() {
    // return this.getKeyNamesWithExchange;
    // RETURN ONLY BINANCE KEYS OR KUCOIN KEYS
    return this.getKeyNamesWithExchange.filter((el: any) => {
      if (el.exchange === "binance" || el.exchange === "binance-us" || el.exchange === "kucoin") {
        return { ...el };
      }
    });
  }

  get getKeyNamesWithExchangeBinanceOnly() {
    return this.getKeyNamesWithExchange.filter((el: any) => el.exchange === "binance");
  }

  /* WATCHERS */
  @Watch("exchange", { immediate: true })
  handleExchange(val: any) {
    if (!val) return;

    if (val.valid) {
      this.isValidKey = true;

      this.fetchLimitPrice();
    } else {
      this.$notify({ text: `API key for ${val.name} account is not valid. Trading is blocked`, type: "error" });
      this.isValidKey = false;
    }
  }

  async handlePairSelection() {
    await this.fetchLimitPrice();
    this.calcBaseAvailable();

    if (this.$refs.newOrderSimple) {
      this.$refs.newOrderSimple.validateFields();
    }
  }

  async fetchLimitPrice() {
    const currencyPair: any = this.selectedCurrencyPair;
    let pairSymbol = currencyPair.symbolForData;
    await this.fetchCurrentPriceAction({ exchange: currencyPair, symbol: pairSymbol });
  }

  /* HOOKS */
  async created() {
    const defaultAccuont = this.getKeyNamesWithExchange.find((e: any) => e.exchange === "binance");
    if (defaultAccuont) {
      this.setExchange(defaultAccuont);
      this.handleAccountSelection(defaultAccuont);
      this.fetchLimitPrice();
    }
  }

  /* METHODS */
  editEntry(index: number) {
    this.editIndex = index;
    const formData = this.orderOperations.entry[index];

    this.$refs.entry.editEntry(formData, index);
  }

  editTarget(index: number) {
    this.editIndex = index;
    const formData = this.orderOperations.target[index];

    this.$refs.target.editTarget(formData, index);
  }

  editStopLoss() {
    const formData = this.orderOperations.stopLoss;

    this.$refs.stopLoss.editStopLoss(formData);
  }

  handleAccountSelection(item: any) {
    this.resetOrderOperations();

    this.setExchange(item);

    this.selectedPair =
      this.getAvailablePairs.find((pair: any) => pair.baseCurrency === "BTC" && pair.quoteCurrency === "USDT") || this.getAvailablePairs[0];
    if (this.currentPair) {
      this.selectedPair =
        this.getAvailablePairs.find(
          (pair: any) => pair.baseCurrency === this.currentPair.baseCurrency && pair.quoteCurrency === this.currentPair.quoteCurrency
        ) || this.getAvailablePairs[0];
    }
    this.getBaseAvailable();
    this.fetchTradesFormats();
  }

  getBaseAvailable() {
    this.$http.get(`/api/portfolio/trade-balance/${this.exchange.id}`).then(({ data }) => {
      this.selectedAccountDist = data;
      this.isGetBaseAvailableDone = true;
      this.calcBaseAvailable();
    });
  }

  calcBaseAvailable() {
    // Depend on operation type BUY/SELL find the appropriate currency
    let currency = this.selectedOperationType === "buy" ? this.selectedPair.quoteCurrency : this.selectedPair.baseCurrency;

    if (this.selectedPair.perpetualContract && this.selectedPair.inverse) {
      currency = "BTC"; // order cost is always XBT (display) for bitmex, but is actually = to BTC in the balance received from the API (because it is BTC)
    }
    // check if distribution with this currency exist
    if (this.selectedAccountDist && this.selectedAccountDist.freeBalances) {
      const notExist = Object.keys(this.selectedAccountDist.freeBalances).length === 0;

      if (notExist) {
        this.baseAvailable = 0.0;
      } else {
        if (currency in this.selectedAccountDist.freeBalances) {
          this.baseAvailable = this.selectedAccountDist.freeBalances[currency];
        } else {
          this.baseAvailable = 0.0;
        }
        // if (typeof this.baseAvailable === "string") {
        //   console.warn("baseAvailable is a STRING :", this.baseAvailable);
        // }
      }
    }
  }

  saveOperation({ formData, type }: any) {
    // If edix index exist rewrite existiong order
    if (this.editIndex !== null) {
      if (type === "stopLoss") {
        this.orderOperations.stopLoss = formData;
      } else {
        const updatedEntry = [...(this.orderOperations as any)[type]];

        updatedEntry[this.editIndex] = formData;

        (this.orderOperations as any)[type] = updatedEntry;
        this.editIndex = null;
      }
    } else {
      // Add new order
      if (type === "stopLoss") {
        this.orderOperations.stopLoss = formData;
      } else {
        (this.orderOperations as any)[type].push(formData);
      }
    }
  }

  handleRemove({ index, type }: any) {
    if (type === "stopLoss") {
      this.orderOperations.stopLoss = null;
      return false;
    }
    (this.orderOperations as any)[type].splice(index, 1);
  }

  resetOrderOperations() {
    this.orderOperations = orderOperationsDefault();
    this.calcBaseAvailable();

    // TODO
    if (this.$refs && this.$refs.entry) {
      const arr = ["entry", "target", "stopLoss"];

      arr.forEach((ref: string) => {
        // @ts-ignore
        this.$refs[ref].isOpen = false;
      });
    }
  }

  createNewSimpleOrder() {
    const data = {
      exchange: this.exchange.exchange,
      apiKeyRef: this.exchange.id,
      symbol: this.selectedCurrencyPair.symbol,
      side: this.selectedOperationType.toUpperCase(),
      ...this.$refs.newOrderSimple.getFormData(),
    };

    this.orderData = data;

    this.$refs.confirmOrderModal.show().then(() => {
      this.isDisabledConfirmOrder = true;
      this.$http
        .post("/api/trade/directorder", data)
        .then(() => {
          this.changeUnreadOrders(true);
        })
        .catch((e: any) => {
          this.$notify({ text: "Sorry, operation failed", type: "error" });
        })
        .finally(() => {
          this.isDisabledConfirmOrder = false;
        });
    });
  }

  createNewOrder() {
    // this.$notify({ text: "New Order has been successfully created", type: "success" });

    const entries = mapEntries(this.orderOperations.entry);
    const quantity = entries.map((e) => e.quantity).reduce((acc, curr) => acc + curr);
    const takeProfits = mapTakeProfits(this.orderOperations.target, quantity);
    // const stopLoss = mapStopLoss(this.orderOperations.stopLoss);
    const stopLoss = mapStopLoss(this.orderOperations.stopLoss);
    const strategyRequest = {
      exchange: this.exchange.exchange,
      apiKeyRef: this.exchange.id,
      symbol: this.selectedCurrencyPair.symbol,
      side: this.selectedOperationType.toUpperCase(),
      entries,
      takeProfits,
      stopLoss,
      quantity, // total quote quantity
    } as CreateStrategyOrderDto;

    // this.isComingSoonModal = true;

    // this.$refs.launchingPopup
    //   .show(strategyRequest, this.exchange.name, this.selectedCurrencyPair)
    //   // in case user press confirm
    //   .then(() => {
    //     this.createNewStrategyOrderAction(strategyRequest)
    //       .then((res: any) => {
    //         this.resetOrderOperations(); // this.operationTypeChange();
    //         this.$emit("switchToOrder");
    //       })
    //       .catch((error: Error) => {
    //         this.$notify({ text: error.message, type: "error" });
    //       });
    //   })
    //   // in case user press cancel
    //   .catch(() => {});
  }
}
</script>
