/* eslint-disable max-classes-per-file */

import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import * as mongoose from "mongoose";
import * as colNames from "../../models/database-collection";

@Schema()
export class Evolution extends Document {
  @Prop()
  user: string;

  @Prop()
  account: string;

  @Prop()
  date: string;

  @Prop()
  realDate: Date;

  @Prop()
  exchange: string;

  @Prop()
  usd: number;

  @Prop()
  eur: number;

  @Prop()
  btc: number;
}

export const EvolutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    exchange: {
      type: String,
      required: true,
    },
    realDate: {
      type: Date,
      required: true,
    },
    usd: {
      type: Number,
      required: true,
    },
    eur: {
      type: Number,
      required: true,
    },
    btc: {
      type: Number,
      required: true,
    },
  },
  {
    autoIndex: true,
    collection: colNames.PORTFOLIO_EVOLUTION_COLLECTION,
  }
).index(
  {
    user: 1,
    account: 1,
    date: 1,
  },
  { unique: true }
);

export interface EvolutionData {
  date: string;
  realDate?: Date;
  btc: number;
  eur: number;
  usd: number;
}

export interface AccountsEvolution {
  account: string;
  exchange: string;
  data: Array<EvolutionData>;
}

export interface PortfolioEvolution {
  accounts: Array<AccountsEvolution>;
  aggregated: Array<EvolutionData>;
}

class EvolutionDataDto extends Document {
  @ApiProperty()
  date: string;

  @ApiProperty()
  realDate: Date;

  @ApiProperty()
  btc: number;

  @ApiProperty()
  eur: number;

  @ApiProperty()
  usd: number;
}

class AccountsEvolutionDto extends Document {
  @ApiProperty()
  account: string;

  @ApiProperty()
  exchange: string;

  @ApiProperty({ type: [EvolutionDataDto] })
  data: EvolutionDataDto;
}

export class GetPortfolioEvolutionDto extends Document {
  @ApiProperty({ type: [AccountsEvolutionDto] })
  accounts: AccountsEvolutionDto;

  @ApiProperty({ type: [EvolutionDataDto] })
  aggregated: EvolutionDataDto;
}
