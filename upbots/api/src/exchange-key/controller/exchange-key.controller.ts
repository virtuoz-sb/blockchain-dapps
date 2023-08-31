import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Logger,
  Put,
  BadRequestException,
  Delete,
  Param,
  UnprocessableEntityException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiTags, ApiResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import MarketingAutomationService from "src/marketing-automation/marketing-automation.service";
import UserFromJWT from "../../utilities/user.decorator";
import { UserIdentity } from "../../types/user";
import { ExchangeKeyCreationDto, ExchangeKeyDto, ExchangeKeyEditDto } from "../../types/exchange-key";
import ExchangeKeyService from "../services/exchange-key.service";
import ExchangeKeyStatisticsService from "../services/exchange-key.statistics.service";
import validationPipe from "../../shared/validation.pipe";
import MailService from "../../shared/mail.service";

@ApiTags("exchange-keys")
@Controller("keys")
export default class ExchangeKeysController {
  private readonly logger = new Logger(ExchangeKeysController.name);

  constructor(
    private keyService: ExchangeKeyService,
    private keyStatisticsService: ExchangeKeyStatisticsService,
    private mailService: MailService,
    private automationService: MarketingAutomationService
  ) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({
    status: 200,
    type: ExchangeKeyDto,
    description: "returns a list of keys",
    isArray: true,
  })
  @ApiOperation({
    summary: "get all keys",
    description: `Returns users exchange keys.`,
  })
  async getAllkeys(@UserFromJWT() user: UserIdentity): Promise<ExchangeKeyDto[]> {
    return this.keyService.findAllKeysForDisplay(user.id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "add new key",
    description: `Add a new exchange key to the users key store.`,
  })
  async addNewKey(
    @UserFromJWT() userInfo: UserIdentity,
    @Body(validationPipe)
    data: ExchangeKeyCreationDto
  ): Promise<ExchangeKeyDto[]> {
    await this.keyService.createKey(userInfo.id, data);
    const results = await this.keyService.findAllKeysForDisplay(userInfo.id);
    this.mailService.sendExchangeAdded(userInfo.email, userInfo.firstname);
    this.automationService.handleUserAddExchange(userInfo.id);
    return results;
  }

  @Post("/validity-check/:keyId")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: 'Check if the key is valid and update "valid" status',
    description: `
      Check if the key is valid. 
      If yes, it does enable or keep enabled the key.
      If no, it disable or keep disabled the key.
    `,
  })
  @ApiParam({
    name: "keyId",
    type: String,
    required: true,
  })
  async healthValidityCheck(@Param("keyId") keyId: string): Promise<ExchangeKeyDto> {
    const checked = await this.keyService.postValidityCheck(keyId);

    if (!checked) {
      throw new BadRequestException();
    }
    const result = await this.keyService.findOneKeyForDisplay(keyId);
    return result;
  }

  @Post("/check-all-invalid-keys")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: 'Check all the invalid keys and update "valid" status' })
  async allInvalidKeysHealthValidityCheck(): Promise<ExchangeKeyDto[]> {
    return this.keyService.checkAllKeys();
  }

  @Put()
  @UseGuards(AuthGuard("jwt"))
  async editKey(
    @UserFromJWT() userInfo: UserIdentity,
    @Body(validationPipe)
    data: ExchangeKeyEditDto
  ): Promise<ExchangeKeyDto[]> {
    const updated = await this.keyService.updateKey(userInfo.id, data);
    // this.logger.debug(`editKey ${JSON.stringify(data)}`);
    if (!updated) {
      throw new BadRequestException(); // returns 400 if entity was not updated
    }
    await this.keyService.postValidityCheck(data.id);
    const results = await this.keyService.findAllKeysForDisplay(userInfo.id);
    return results;
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  async deleteKey(@UserFromJWT() userInfo: UserIdentity, @Param("id") keyId: string): Promise<ExchangeKeyDto[]> {
    if (!keyId) {
      throw new UnprocessableEntityException();
    }
    const done = await this.keyService.deleteKey(userInfo.id, keyId);
    if (!done) {
      throw new BadRequestException(); // returns 400 if entity was not updated
    }
    const results = await this.keyService.findAllKeysForDisplay(userInfo.id);
    return results;
  }

  @Post("statistics")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({
    status: 200,
    type: Object,
    description: "returns a statistics",
  })
  @ApiOperation({
    summary: "get statistics per exchanges",
    description: `Returns exchange statistics.`,
  })
  async getStatistics(@UserFromJWT() user: UserIdentity, @Body() data: Record<string, any>): Promise<Record<string, any>> {
    const ret = await this.keyStatisticsService.getStatistics(data);
    return ret;
  }
}
