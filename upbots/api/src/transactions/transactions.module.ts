import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import TransactionsSchema from "./schemas/transactions.schema";
import IpnsSchema from "./schemas/ipns.schema";
import IpnsRepository from "./repositories/ipns.repository";
import TransactionsRepository from "./repositories/transactions.repository";
import TransactionsController from "./controllers/transactions.controller";
import IpnsController from "./controllers/ipns.controller";
import SubscriptionsSchema from "./schemas/subscriptions.schema";
import SubscriptionsRepository from "./repositories/subscriptions.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Transaction", schema: TransactionsSchema },
      { name: "Ipn", schema: IpnsSchema },
      { name: "Subscription", schema: SubscriptionsSchema },
    ]), // model service implicitly
  ],
  controllers: [TransactionsController, IpnsController],
  providers: [TransactionsRepository, IpnsRepository, SubscriptionsRepository],
})
export default class TransactionsModule {}
