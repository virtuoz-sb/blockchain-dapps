import { ApiProperty } from "@nestjs/swagger";

export default class TransactionsDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  quoteCurrency: string;

  @ApiProperty()
  pagination: {
    hasMore: boolean;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };

  @ApiProperty()
  items: {
    blockSignedAt: Date;
    txHash: string;
    txOffset: number;
    successful: boolean;
    from: {
      address: string;
      label: string;
    };
    to: {
      address: string;
      label: string;
    };
    value: number;
    valueQuote: number;
    gas: {
      offered: number;
      spent: number;
      price: number;
      quote: number;
      quoteRate: number;
    };
  }[];
}
