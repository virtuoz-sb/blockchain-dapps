<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Radar } from "vue-chartjs";

@Component({ name: "RadarChart", extends: Radar })
export default class RadarChart extends Vue {
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
