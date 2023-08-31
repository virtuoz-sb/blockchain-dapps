import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { mongoDB } from '@torobot/shared';

@Injectable()
export class ReportService {
  constructor() {}

  async getAll() {
      return mongoDB.LiquidatorTransactions.aggregate(
          [{
              $group: {
                  _id: {liquidator: '$liquidator'},
                  fee: { $sum: "$fee"},
                  tokenAmount: { $sum: '$tokenAmount'},
                  total: { $sum: "$price"},
                  token: { $first: "$token"},
                  isDex: { $first: "$isDex"}
              }
          }, 
          {
              "$lookup": {
                  "from": "tokens",
                  "localField": "token",
                  "foreignField": "_id",
                  "as": "token"
              }
          },
          {
              "$unwind": {"path": "$token"}
          }
          ]
      )
  }

  async getByLiquidator (id: string) {
      const query = mongoDB.LiquidatorTransactions.find({"liquidator": id}).sort({created: -1});
      return mongoDB.LiquidatorTransactions.populateModel(query);
  }

  async getByWasher (id: string) {
    let data = await mongoDB.WasherTransactions.aggregate(
      [{
        $match: {washer: String(id)}
      },
      {
        $group: {
          _id: '$date',
          count: {$sum: 1},
          timeStamp: {$avg: "$timeStamp"},
          targetVolume: {$sum: "$targetVolume"},
          volume: {$sum: "$volume"},
          fee: {$sum: "$fee"},
          loss: {$sum: "$loss"}
        }
      },
      {
        $sort: {timeStamp: -1}
      }]
    );

    data = data.map(el => {
      return {
        date: el._id,
        targetVolume: el.count ? el.targetVolume/el.count : 0,
        volume: el.volume,
        fee: el.fee,
        loss: el.loss
      };
    })
    return data;
  }

  async getTokenMintBurnTransactions (id: string) {
    const query = mongoDB.TokenMintBurnTransaction.find({"tokenCreator": id}).sort({created: -1});
    return mongoDB.TokenMintBurnTransaction.populateModel(query);
  }

  async getLiquidityPoolTransactions (id: string) {
    const query = mongoDB.LiquidityPoolTransaction.find({"tokenCreator": id}).sort({created: -1});
    return mongoDB.LiquidityPoolTransaction.populateModel(query);
  }
}