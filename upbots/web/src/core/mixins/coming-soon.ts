import { Vue, Component } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { PageSettings } from "@/store/user/types";
const userModule = namespace("userModule");

@Component
export class ComingSoon extends Vue {
  /* V U E X */
  @userModule.State pageSettings: PageSettings[];

  /* D A T A */
  isComingSoon: boolean = false;

  /* H O O K S */
  created() {
    const { name } = this.$route;

    const settingsForCurrentPage = this.pageSettings.find((page: PageSettings) => page.name === name);

    if (settingsForCurrentPage) {
      this.isComingSoon = settingsForCurrentPage.comingSoon;
    }
  }
}
