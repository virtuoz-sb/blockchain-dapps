<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Line, mixins } from "vue-chartjs";

@Component({ name: "LineChart", extends: Line, mixins: [mixins.reactiveProp] })
export default class LineChart extends Vue {
  /* PROPS */
  @Prop({ required: true }) chartData: object;
  @Prop({ required: true }) options: object;

  /* DATA */
  renderChart: any;

  /* HOOKS */
  mounted() {
    // console.log(this.chartData);
    this.renderChart(this.chartData, this.options);
  }
}
</script>
