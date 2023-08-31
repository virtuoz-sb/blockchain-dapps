import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export default class CronJobsInterceptorService implements OnApplicationBootstrap {
  constructor(private schedule: SchedulerRegistry) {}

  private readonly logger = new Logger(CronJobsInterceptorService.name);

  async onApplicationBootstrap() {
    // <- Nestjs hook invoked when the app bootstrapped
    const uncompletedOrderTrackingsId = "uncompleted-order-trackings";
    const perfeesTransactionsId = "perfees-transactions";
    const stakingPoolTransactionId = "staking-pool-transaction";
    const paidSubscriptionsId = "paid-subscriptions";

    const allCrons = this.schedule.getCronJobs();
    if (process.env.DISABLE_CRON_JOBS === "true") {
      allCrons.forEach((key, id) => {
        if (
          !(
            id === uncompletedOrderTrackingsId ||
            id === perfeesTransactionsId ||
            id === stakingPoolTransactionId ||
            id === paidSubscriptionsId
          )
        ) {
          this.logger.log(`CRON JOB ${id} STOPPED`);
          this.schedule.getCronJob(id).stop();
        }
      });
    }
    if (process.env.DISABLE_CRON_JOB_PERF_FEES_JOBS === "true") {
      this.logger.log(`CRON JOB ${uncompletedOrderTrackingsId} STOPPED`);
      this.logger.log(`CRON JOB ${perfeesTransactionsId} STOPPED`);
      this.logger.log(`CRON JOB ${stakingPoolTransactionId} STOPPED`);
      this.logger.log(`CRON JOB ${paidSubscriptionsId} STOPPED`);

      this.schedule.getCronJob(uncompletedOrderTrackingsId).stop();
      this.schedule.getCronJob(perfeesTransactionsId).stop();
      this.schedule.getCronJob(stakingPoolTransactionId).stop();
      this.schedule.getCronJob(paidSubscriptionsId).stop();
    }
  }
}
