<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Doughnut, mixins } from "vue-chartjs";

@Component({ name: "DoughnutChart", extends: Doughnut, mixins: [mixins.reactiveProp] })
export default class DoughnutChart extends Vue {
  /* PROPS */
  @Prop({ required: true }) chartData: object;
  @Prop({ required: true }) options: object;

  /* DATA */
  renderChart: any;

  /* HOOKS */
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
}
</script>
