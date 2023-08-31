<template>
  <GeneralLayout title="Admin View: Data extract" content-custom-classes="flex-col relative overflow-y-auto custom-scrollbar">
    <div class="w-full">
      <div class="p-10 mb-10 gradient-2">
        <h1 class="text-xxl text-white my-20">Fetch all users UBXT LOCKED owners</h1>
        <AppDivider class="bg-grey-100 my-20" />
        <div class="flex flex-row items-center justify-between mb-20">
          <div class="flex flex-col items-right w-1/3">
            <AppButton @click="getUBXTowners">Fetch Data</AppButton>
          </div>
          <div class="flex flex-col items-center items-left w-2/3">
            <AppButton
              v-if="ubxtlockedOwnerList.hasOwnProperty('countingDate')"
              type="primary"
              @click="exportCSVFile(generateInputCSVOwners)"
              >Download CSV File</AppButton
            >
            <AppButton v-else disabled type="primary">Download CSV File</AppButton>
          </div>
        </div>
      </div>
      <div class="p-10 mb-10 gradient-2">
        <h1 class="text-xxl text-white my-20">Check if user is UBXT LOCKED owner</h1>
        <AppDivider class="bg-grey-100 my-20" />
        <div class="flex flex-row items-center justify-between mb-20">
          <div class="flex flex-col items-right w-1/3">
            <div class="flex flex-row mb-10">
              <div class="flex flex-col justify-around items-left w-1/4">
                <label class="text-white">User Email:</label>
              </div>
              <div class="flex flex-col justify-around items-right w-3/4">
                <AppInput v-model="ownerEmail" class="m-3" name="email" type="email" />
              </div>
            </div>
            <AppButton @click="searchEmail" type="primary">Check User</AppButton>
          </div>
          <div class="flex flex-col items-center items-left w-2/3">
            <div
              v-if="ownerEmailFound === 'found'"
              class="flex justify-center items-center p-15 border-2 rounded bg-green-cl-200 text-white"
            >
              <h2>User Found!</h2>
            </div>
            <div
              v-else-if="ownerEmailFound === 'notFound'"
              class="flex justify-center items-center p-15 border-2 rounded bg-red-cl-100 text-white"
            >
              <h2>User Not Found</h2>
            </div>
            <div v-else class="flex justify-center items-center p-15"></div>
          </div>
        </div>
      </div>
      <div class="p-10 mb-10 gradient-2">
        <h1 class="text-xxl text-white mb-15">Create coupons</h1>
        <AppDivider class="bg-grey-100 my-20 w-full" />
        <div class="flex flex-row items-center justify-between mb-20">
          <div class="flex flex-col items-right w-1/3">
            <div class="flex flex-row mb-10">
              <div class="flex flex-col justify-around items-left w-1/4">
                <label class="text-white">Name:</label>
                <label class="text-white">Description:</label>
                <label class="text-white">Coupon Type:</label>
                <label class="text-white">Quantity:</label>
                <label class="text-white">Valid From:</label>
                <label class="text-white">Valid To:</label>
              </div>
              <div class="flex flex-col justify-around items-right w-3/4">
                <AppInput class="m-3" v-model="couponData.promoName" name="promoName" type="text" />
                <AppInput class="m-3" v-model="couponData.description" name="description" type="text" />
                <AppInput class="m-3" v-model="couponData.couponType" name="couponType" type="text" />
                <AppInputNumber class="m-3" v-model="couponData.quantity" name="quantity" type="number" min="1" />
                <AppInput class="m-3" v-model="couponData.validFrom" name="validFrom" type="date" />
                <AppInput class="m-3" v-model="couponData.validTo" name="validTo" type="date" />
              </div>
            </div>
            <AppButton type="primary" @click="getNewCoupons">Create Coupons</AppButton>
          </div>
          <div class="flex flex-col items-center items-left w-2/3">
            <AppButton v-if="coupons.length > 0" type="primary" @click="exportCSVFile(generateInputCSVCoupons)"
              >Download CSV File</AppButton
            >
            <AppButton v-else :disabled="true" type="primary">Download CSV File</AppButton>
          </div>
        </div>
      </div>
    </div>
  </GeneralLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import GeneralLayout from "@/views/GeneralLayout.vue";
import moment from "moment";
import { UbxtLockedOwnerList, CouponPayload } from "../../store/admin-extract/types/admin-extract.payload";

const adminextract = namespace("adminExtractModule");

@Component({ name: "AdminExtract", components: { GeneralLayout } })
export default class AdminExtract extends Vue {
  /* VUEX */
  @adminextract.State ubxtlockedOwnerList: any;
  @adminextract.State coupons: [];
  @adminextract.State couponPayload: Partial<CouponPayload>;
  @adminextract.State error: any;
  @adminextract.Action fetchOwners: () => Promise<UbxtLockedOwnerList[]>;
  @adminextract.Action setCouponPayload: (payload: Partial<CouponPayload>) => any;
  @adminextract.Action createCoupons: (payload: Partial<CouponPayload>) => Promise<[]>;
  @adminextract.Getter getUBXTOwners: UbxtLockedOwnerList[];
  @adminextract.Getter generateInputCSVOwners: any;
  @adminextract.Getter getCouponPayload: any;
  @adminextract.Getter generateInputCSVCoupons: any;

  /* WATCHERS */
  @Watch("error", { immediate: true, deep: true })
  onDataChange() {
    if (this.error) {
      this.$notify({ text: this.error.message, type: "error" });
    }
  }
  /* Data */
  ownerEmail: String = "";
  ownerEmailFound: String = "";
  couponData: CouponPayload = {
    promoName: "2020-11-STAKING-PROMO",
    description: "Coupon giving access to algobot for the people participating to the FTX staking program",
    couponType: "unique",
    quantity: 50,
    validFrom: moment().format("YYYY-MM-DD"),
    validTo: moment().add(1, "months").format("YYYY-MM-DD"),
  };
  /* METHODS */
  exportCSVFile(inputArr: any) {
    let header = inputArr.arrHeader.join(",") + "\n";
    inputArr.arrRow.forEach((arr: String[]) => (header += arr.join(",") + "\n"));
    let csvData = new Blob([header], { type: "text/csv" });
    let csvUrl = URL.createObjectURL(csvData);
    let hiddenElement = document.createElement("a");
    hiddenElement.href = csvUrl;
    hiddenElement.target = "_blank";
    hiddenElement.download = inputArr.fileName + ".csv";
    hiddenElement.click();
  }
  async searchEmail() {
    if (this.ownerEmail) {
      this.ownerEmailFound = "";
      await this.fetchOwners();
      if (this.ubxtlockedOwnerList.owners) {
        this.ownerEmailFound = this.ubxtlockedOwnerList.owners.find(
          (owner: { id: string; email: string }) => owner.email === this.ownerEmail
        )
          ? "found"
          : "notFound";
      }
    }
  }
  getUBXTowners() {
    this.fetchOwners();
  }
  getNewCoupons() {
    this.setCouponPayload(this.couponData);
    this.createCoupons(this.couponPayload);
  }
}
</script>

}
