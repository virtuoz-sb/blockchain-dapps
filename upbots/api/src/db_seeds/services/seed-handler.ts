import { LoggerService } from "@nestjs/common";

export const seedHandler = async function seedHandler<T>(
  seedFunc: () => Promise<Result<T>[]>,
  doSeed: boolean,
  log: LoggerService
): Promise<void> {
  try {
    if (doSeed) {
      log.warn(`Auto-Seed enabled, will run seed ..`);
      const results = await seedFunc();
      const errors = results?.filter((x) => x.error);
      if (errors) {
        errors.forEach((e) => log.error(e));
      }
      log.warn(`Auto-Seed executed ${results?.length} results (${errors?.length} errors).`);
    } else {
      log.warn(`Auto-Seed is DISABLED, seed scripts didn't run.`);
    }
  } catch (err) {
    log.error(`All Seeding failed (fatal) : ${err}`);
    log.error(err); // full stack trace log
  }
};

export interface Result<T> {
  data: T;
  error: Error;
}
