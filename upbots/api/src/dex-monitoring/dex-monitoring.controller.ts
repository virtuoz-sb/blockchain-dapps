import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Logger,
  ParseBoolPipe,
  ParseIntPipe,
  Put,
  Query,
  BadRequestException,
  UnprocessableEntityException,
  UseGuards,
  Delete,
  Post,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import ParseEthAdressesPipe from "src/shared/parse-eth-address.pipe";
import { UserIdentity } from "src/types";
import RouteSegments from "src/utilities/route-segment-name";
import UserFromJWT from "src/utilities/user.decorator";
import DexMonitoringService from "./dex-monitoring.service";
import DexWalletsService from "./dex-wallets.service";
import DexEvolutionService from "./dex-evolution.service";
import BalancesDto from "./models/balances.dto";
import DexWalletDto from "./models/dexWallets.dto";
import TransactionsDto from "./models/transactions.dto";
import AdminGuard from "../shared/admin.guard";

@ApiTags(RouteSegments.DexMonitoring)
@Controller(RouteSegments.DexMonitoring)
@UseGuards(AuthGuard("jwt"))
export default class DexMonitoringController {
  private readonly logger = new Logger(DexMonitoringController.name);

  private readonly chainIds = {
    mainnet: 1,
    matic: 137,
  };

  private readonly isAsc = {
    asc: true,
    dsc: false,
  };

  constructor(
    private dexMonitoringService: DexMonitoringService,
    private dexWalletsService: DexWalletsService,
    private dexEvolutionService: DexEvolutionService
  ) {}

  @Put("wallet")
  @ApiOperation({
    summary: "Add a dex wallet to the user",
    description: `
      For a given user id, add the list of wallets that is provided in the body. A dex wallet is composed of label and wallet address.
    `,
  })
  async createWallet(@Body() wallets: DexWalletDto[], @UserFromJWT() user: UserIdentity) {
    if (!wallets || !wallets.length) {
      throw new UnprocessableEntityException("a list of wallets to create is required");
    }

    try {
      const response = await this.dexWalletsService.createWallets(wallets, user.id);
      return response;
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException("The provided wallet address already exists for this user");
      } else {
        this.logger.error("Unknown Error when adding a new dex wallet", "DexMonitoringController");
        this.logger.error(e, "DexMonitoringController");
        throw new Error("Unknown Error when adding a new dex wallet");
      }
    }
  }

  @Get("wallet")
  @ApiOperation({
    summary: "Get the list of all dex wallets for the given user",
  })
  async getWallets(@UserFromJWT() user: UserIdentity) {
    return this.dexWalletsService.getWallets(user.id);
  }

  @Delete("wallet")
  @ApiOperation({
    summary: "Delete a single dex wallet from the user account",
  })
  async deleteWallet(@Query("address") address: string, @UserFromJWT() user: UserIdentity) {
    return this.dexWalletsService.deleteWallet(address, user.id);
  }

  @Post("evolution")
  @ApiOperation({
    summary: "Get the list of all dex wallets for the given user",
  })
  async getEvolution(@Body() oldEvolution: any, @UserFromJWT() user: UserIdentity) {
    return this.dexEvolutionService.getEvolution(user.id, oldEvolution);
  }

  @Get("balance")
  @ApiOperation({
    summary: "Get the balances and defi projects of a list of addresses.",
    description: `
      For a given eth address, returns a list of all ERC20 and defi projects balances along with their current spot prices.

      Requires the list of addresses for which we should get the balances and the defi projects.
    `,
  })
  @ApiQuery({
    name: "addresses",
    type: String,
    required: true,
    example: "0x5B73898569F0ADf8839366fD84F7F8F2B51100D4,debanker.eth",
  })
  @ApiResponse({
    status: 200,
    type: BalancesDto,
    description: "Returns a list of all ERC20 and NFT token balances along with their current spot prices.",
  })
  async getAddressBalances(
    @Query("addresses", ParseEthAdressesPipe)
    addresses: string,
    @Query("liveFetch", new DefaultValuePipe(false), new ParseBoolPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }))
    liveFetch: boolean
  ): Promise<BalancesDto> {
    this.logger.debug(`getAddressBalances for addresses: ${addresses}`, "DexMonitoringController");

    try {
      const addressList = addresses.split(",");
      const response = this.dexMonitoringService.getAddressBalances(addressList, liveFetch);
      return response;
    } catch (e) {
      if (e.response?.data) {
        this.logger.error(e.response.data, "DexMonitoringController");
        throw new Error(e.response.data);
      } else {
        this.logger.error("Unknown Error when calling covalent api on dex monitoring", "DexMonitoringController");
        throw new Error("Unknown Error when calling covalent api on dex monitoring");
      }
    }
  }

  @Get("transactions")
  @ApiOperation({
    summary: "Get transactions history for an eth address in all supported tokens",
    description: `
      For a given eth address, returns a list of all ERC20 and NFT token previous transactions.

      Requires the address for which we should get the transactions.

      Support an optional chain filter to query either the default Eth Mainnet or Matic, by default returns the results from the Eth Mainnet.
      Support an optional nft filter to decide whether it returns nft tokens or not, which is true by default.
    `,
  })
  @ApiQuery({
    name: "address",
    type: String,
    required: true,
    example: "0x5B73898569F0ADf8839366fD84F7F8F2B51100D4",
  })
  @ApiQuery({
    name: "chain",
    type: String,
    required: false,
    example: "mainnet",
  })
  @ApiQuery({
    name: "sort",
    type: String,
    required: false,
    example: "dsc",
  })
  @ApiQuery({
    name: "pageNumber",
    type: Number,
    required: false,
    example: 0,
  })
  @ApiQuery({
    name: "pageSize",
    type: Number,
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    type: TransactionsDto,
    description: "Returns a list of all ERC20 and NFT token balances along with their current spot prices.",
  })
  async getTransactionsHistory(
    @Query("address", ParseEthAdressesPipe)
    address: string,
    @Query("chain") chain: "mainnet" | "matic" = "mainnet",
    @Query("sort") sort: "asc" | "dsc" = "dsc",
    @Query("pageNumber", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }))
    pageNumber: number,
    @Query("pageSize", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }))
    pageSize: number
  ): Promise<TransactionsDto> {
    if (chain !== "mainnet" && chain !== "matic") {
      throw new UnprocessableEntityException('Chain param can only be "mainnet" or "matic"');
    }
    if (sort !== "asc" && sort !== "dsc") {
      throw new UnprocessableEntityException('Sort param can only be "asc" or "dsc"');
    }

    this.logger.debug(`getTransactionsHistory for address: ${address}`, "DexMonitoringController");

    try {
      const response = await this.dexMonitoringService.getTransactionsHistory(
        address,
        this.chainIds[chain],
        this.isAsc[sort],
        pageNumber,
        pageSize
      );
      return response;
    } catch (e) {
      if (e.response?.data) {
        this.logger.error(e.response.data, "DexMonitoringController");
        throw new Error(e.response.data);
      } else {
        this.logger.error("Unknown Error when calling covalent api on dex monitoring", "DexMonitoringController");
        this.logger.error(e, "DexMonitoringController");
        throw new Error("Unknown Error when calling covalent api on dex monitoring");
      }
    }
  }

  @Post("dex-evolution-task")
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: "Run dexEvolutionTask function via admin",
  })
  async execDexEvolutionTask() {
    return this.dexEvolutionService.runDexEvolutionTask();
  }
}
