import { Injectable, Logger, UnprocessableEntityException, Inject } from "@nestjs/common";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { CreateStratRequest, AccountInfo, Market, SideType, TakeProfit, Entry } from "../../proto/stratege/strat_pb";
import { StrategeServiceClient } from "../../proto/stratege/strat_grpc_pb"; // Error: Cannot find module '../proto/stratege/strat_grpc_pb' ==> missing js files in /dist
import * as dto from "../model/create-strategy-dto";
import { GRPC_STRATEGE_CLIENT } from "../grpc-client/grpc-startege-client-factory";

@Injectable()
export default class StrategyRequestService {
  private readonly logger = new Logger(StrategyRequestService.name);

  constructor(
    @Inject(GRPC_STRATEGE_CLIENT)
    private readonly client: StrategeServiceClient
  ) {}

  checkEngineHealth(): Promise<boolean> {
    this.logger.debug(`checkEngineHealth`);

    const p = new Promise<boolean>((resolve, reject) => {
      this.client.healthCheck(new Empty(), (err, response) => {
        this.logger.debug("checkEngineHealth callback !!");

        if (err) {
          this.logger.error(`checkEngineHealth grpc ERROR ${err}`);
          return reject(err);
        }
        this.logger.debug(`checkEngineHealth grpc response ${response}`);
        if (response) {
          return resolve(response.getOkstatus());
        }
        return reject(new Error("checkEngineHealth empty grpc response"));
      });
    });

    return p;
  }

  requestNewStrategy(userId: string, data: dto.CreateManualSignalStrategyDto): Promise<dto.StratCreatedResponseDto> {
    this.logger.debug(`requestNewStrategy for userID: ${userId.toString()}`);
    const requestMessage = this.createMessage(data, userId);
    this.logger.debug(`requestNewStrategy, mapped:${requestMessage}`);

    const p = new Promise<dto.StratCreatedResponseDto>((resolve, reject) => {
      this.logger.debug(
        `requestNewStrategy for userid: ${requestMessage.getAccount().getUserid()}, keyRef: ${requestMessage.getAccount().getApikeyid()}`
      );

      this.client.createStrategie(requestMessage, (err, response) => {
        // this.logger.debug("requestNewStrategy callback !!");

        if (err) {
          this.logger.error(`requestNewStrategy grpc ERROR for userID: ${userId.toString()} : ${err}`);
          return reject(err);
        }
        this.logger.debug(`requestNewStrategy grpc response for userID: ${userId.toString()} : ${response}`);
        if (response) {
          // TODO: convert to a more suitable object response (not the grpc response)
          const created = response.getStrat().toObject();
          return resolve({ id: created.guid } as dto.StratCreatedResponseDto);
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  private createMessage(data: dto.CreateManualSignalStrategyDto, userId: string): CreateStratRequest {
    this.validate(data);

    const x = new CreateStratRequest();
    const account = new AccountInfo();

    account.setUserid(userId);
    account.setApikeyid(data.apiKeyRef);
    x.setAccount(account);
    // const timestamp = google.protobuf.Timestamp.fromObject({
    //     seconds: timeMS / 1000,
    //     nanos: (timeMS % 1000) * 1e6
    //   })
    // const nowStamp= new google_protobuf_timestamp_pb.Timestamp.?
    // message.setCreatedAt()
    if (data.entryRange) {
      x.setEntryrangefrom(data.entryRange.buyRangeMin);
      x.setEntryrangeto(data.entryRange.buyRangeMax);
    }
    if (data.entries) {
      data.entries.forEach((entry) => {
        x.addEntries(this.mapEntry(entry));
      });
    }

    const market = new Market();
    market.setSymbol(data.symbol);
    market.setExchange(data.exchange);
    x.setMarket(market);
    if (data.side && data.side.toUpperCase() === "BUY") {
      x.setSide(SideType.BUY);
    } else if (data.side && data.side.toUpperCase() === "SELL") {
      x.setSide(SideType.SELL);
    } else {
      // error parsing
      throw new UnprocessableEntityException("Invalid orderSide in request data"); // HTTP 422
    }

    x.setStoploss(data.stopLoss);
    x.setVolume(data.quantity);

    this.mapTargets(x, data);

    return x;
  }

  private mapTargets(x: CreateStratRequest, data: dto.CreateManualSignalStrategyDto) {
    this.logger.debug(`mapping Targets ${data.takeProfits}`);
    if (!data.takeProfits || data.takeProfits.length === 0) {
      return; // no mapping
    }
    const targets = new Array<TakeProfit>();

    data.takeProfits.forEach((tp) => {
      const t = new TakeProfit();
      // t1.setStatus(TargetType.PENDING); // avoid stratege error "all newly created target should be pending"

      t.setQuantity(tp.quantity);
      t.setTrigger(tp.triggerPrice);
      targets.push(t);
      this.logger.debug(`mapped targets ${targets}`);
    });
    x.setTakeprofitsList(targets);
  }

  private mapEntry(data: dto.Entry): Entry {
    const x = new Entry();
    x.setLimitentry(data.isLimit);
    x.setMarketentry(data.isMarket);
    if (data.price) x.setLimitprice(data.price);
    x.setQuantity(data.quantity);
    x.setTriggerprice(data.triggerPrice);
    return x;
  }

  /**
   * minimum business validation rules
   * @param x
   */
  private validate(x: dto.CreateManualSignalStrategyDto) {
    if (!x) {
      throw new UnprocessableEntityException("cannot request a null strategy.");
    }
    if (!x.symbol) {
      throw new UnprocessableEntityException(`symbol '${x.symbol}' required.`);
    }
    if (!x.exchange) {
      throw new UnprocessableEntityException(`exchange '${x.exchange}' required.`);
    }
  }
}
