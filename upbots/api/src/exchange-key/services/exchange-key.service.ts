import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Types as DbTypes } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { NestEventEmitter } from "nest-event";
import ProxyFactoryService from "../../exchangeProxy/services/proxy-factory.service";
import { ExchangeKeyCreationDto, ExchangeKeyDto, ExchangeKeyEditDto, ExchangeKey } from "../../types/exchange-key";
import CipherService from "../../shared/encryption.service";
import ExchangeKeyDataService from "./exchange-key.data.service";
import { CredentialInfo, ExchangeCredentials } from "../../portfolio/models";

/* eslint-disable no-underscore-dangle */

type ExchangeCredentialsSelector = () => Promise<ExchangeKey[]>;

@Injectable()
export default class ExchangeKeyService {
  private readonly logger = new Logger(ExchangeKeyService.name);

  constructor(
    private nestEventEmitter: NestEventEmitter,
    private cipherService: CipherService,
    private dataService: ExchangeKeyDataService,
    private config: ConfigService,
    private proxyService: ProxyFactoryService
  ) {}

  async createKey(userId: string, toCreate: ExchangeKeyCreationDto): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const proxy = this.proxyService.setExchangeProxy(toCreate.exchange);
    const isValid = await proxy.checkCredentialsOnCreation({
      apiKey: toCreate.publicKey,
      secret: toCreate.secretKey,
      password: toCreate.password,
      subAccountName: toCreate.subAccountName,
    } as ExchangeCredentials);
    if (!isValid) {
      return false;
    }

    if (!this.config.get<string>("KEYSTORE_ENCK") || !this.config.get<string>("KEYSTORE_AUTHK")) {
      throw new Error("Missing a KEYSTORE variable, please check your .env file");
    }
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    // encrypt secret key only
    const encryptedSecretKey = this.cipherService.encryptWithHmac(toCreate.secretKey, encKey, authKey);
    // save user with new key properties
    const key = await this.dataService
      .createKey(
        userId,
        {
          ...toCreate,
          publicKey: toCreate.publicKey,
          secretKey: encryptedSecretKey,
          password: toCreate.password,
        },
        proxy.accountType,
        proxy.quoteCurrency
      )
      .catch((err) => {
        if (err.name === "MongoError" && err.code === 11000) {
          throw new UnprocessableEntityException("Exchange key validation error", "Key already exists.");
        }
        throw new Error(err.message);
      });

    // Emit the event to launch side effects (snapshotAccountValue, cache invalidation)
    this.nestEventEmitter.emit("key-added", { userId, exchange: toCreate.exchange, keyId: key._id, keyName: key.name });

    // eslint-disable-next-line no-underscore-dangle
    return !key.isNew && key._id;
  }

  async updateKey(userId: string, data: ExchangeKeyEditDto): Promise<boolean> {
    if (!userId) {
      return false;
    }

    // save user with new key properties
    const updated = await this.dataService.updateKey(userId, {
      ...data,
    });

    const keyId: string = data.id;
    this.nestEventEmitter.emit("key-updated", { userId, keyId }); // notifies cache invalidation logic

    return updated;
  }

  async deleteKey(userId: string, keyId: string): Promise<boolean> {
    if (!userId) {
      return Promise.resolve(false);
    }
    const deleted = await this.dataService.deleteKey(userId, keyId);
    this.nestEventEmitter.emit("key-deleted", { userId, keyId }); // notifies cache invalidation logic
    return deleted;
  }

  async findAllKeysForDisplay(userId: string): Promise<ExchangeKeyDto[]> {
    // find user and get his keys list
    return this.dataService.findAllKeysForDisplay(userId);
  }

  async findOneKeyForDisplay(keyId: string): Promise<ExchangeKeyDto> {
    return this.dataService.findOneKeyForDisplay(keyId);
  }

  getDecryptedExchangeCredentialsForExchange(exchangeName: string): Promise<CredentialInfo[]> {
    this.logger.debug(`getDecryptedExchangeCredentialsForExchange for ${exchangeName}`);

    const selector = () => this.dataService.findDecryptedKeysForExchange(exchangeName);
    return this.decryptSelectedKeys(selector);
  }

  /**
   * Returns the exchanges keys decrypted.
   * @param userId
   * @param keynamesFilter
   */
  async getDecryptedExchangeCredentials(userId: string, keynamesFilter?: string[]): Promise<CredentialInfo[]> {
    this.logger.debug(`getDecryptedExchangeCredentials for ${userId} ${keynamesFilter}`);
    const selector = () => this.dataService.findDecryptedKeys(userId, keynamesFilter);
    return this.decryptSelectedKeys(selector);
  }

  private async decryptSelectedKeys(selectorFunc: ExchangeCredentialsSelector): Promise<CredentialInfo[]> {
    const keys = await selectorFunc();
    this.logger.debug(`decryptSelectedKeys for ${keys?.length} keys`);

    if (!keys || keys.length === 0) {
      return [];
    }

    if (!this.config.get<string>("KEYSTORE_ENCK") || !this.config.get<string>("KEYSTORE_AUTHK")) {
      throw new Error("Missing a KEYSTORE variable, please check your .env file");
    }
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    // decrypt all keys
    return keys.map((key: ExchangeKey) => {
      const decrypted = this.cipherService.decryptWithHmac(key.secretKey, encKey, authKey);
      return this.mapToCredentialInfo(key, decrypted);
    });
  }

  /**
   * Returns the exchange key decrypted.
   * @param keyId
   */
  async getDecryptedExchangeCredentialsForOneKey(keyId: string): Promise<CredentialInfo> {
    // TODO: remove this and use decryptSelectedKeys instead (avoid copy paste logic)
    const key = await this.dataService.findOneDecryptedKey(keyId);
    if (!key) {
      return new CredentialInfo();
    }

    if (!this.config.get<string>("KEYSTORE_ENCK") || !this.config.get<string>("KEYSTORE_AUTHK")) {
      throw new Error("Missing a KEYSTORE variable, please check your .env file");
    }
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    // decrypt key
    const decrypted = this.cipherService.decryptWithHmac(key.secretKey, encKey, authKey);
    return {
      id: (key._id as DbTypes.ObjectId).toHexString(), // convert mongo id to string
      exchangeName: key.exchange,
      keyName: key.name,
      valid: key.valid,
      lastHealthCheck: key.lastHealthCheck,
      error: key.error,
      credentials: {
        apiKey: key.publicKey,
        secret: decrypted,
        password: key.password,
        subAccountName: key.subAccountName,
      },
      userId: ((key.userId as unknown) as DbTypes.ObjectId).toHexString(),
    } as CredentialInfo;
  }

  async checkAllKeys(): Promise<ExchangeKeyDto[]> {
    const allKeysId = await this.dataService.findAllInvalidKeyIds();
    const getKeys = allKeysId.map(async (keyId) => {
      await this.postValidityCheck(keyId);
      const exchangeKey = await this.dataService.findOneKeyForDisplay(keyId);
      return exchangeKey;
    });
    return Promise.all(getKeys);
  }

  async postValidityCheck(keyId: string): Promise<boolean> {
    const keyToCheck = await this.getDecryptedExchangeCredentialsForOneKey(keyId);
    const { exchangeName, credentials } = keyToCheck;

    const proxy = this.proxyService.setExchangeProxy(exchangeName);
    const validityStatus = await proxy.healthValidityCheck(credentials);

    return this.dataService.updateValidityStatus(keyId, validityStatus.valid, validityStatus.error);
  }

  async getAllDecryptedExchangeCredentials(keynamesFilter?: string[]): Promise<CredentialInfo[]> {
    // TODO: remove this and use decryptSelectedKeys instead (avoid copy paste logic)
    this.logger.log("getAllDecryptedExchangeCredentials");

    const keys = await this.dataService.findAllDecryptedKeys(keynamesFilter);
    if (!keys || keys.length === 0) {
      this.logger.warn("getAllDecryptedExchangeCredentials no keys found");
      return [];
    }

    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");
    if (encKey && authKey) {
      this.logger.log(`getAllDecryptedExchangeCredentials encKey :${encKey.substr(0, 3)}`);
      this.logger.log(`getAllDecryptedExchangeCredentials authKey :${authKey.substr(0, 3)}`);
    } else {
      this.logger.warn("getAllDecryptedExchangeCredentials MISSING CONFIGURATION");
    }
    // decrypt all keys

    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      try {
        const decrypted = this.cipherService.decryptWithHmac(key.secretKey, encKey, authKey);
        const credInfo = this.mapToCredentialInfo(key, decrypted);
        result.push(credInfo);
      } catch (err) {
        this.logger.warn(`getAllDecryptedExchangeCredentials decryption failed for pubkey ${key.publicKey} userid:${key.userId}`);
        this.logger.error(err);
      }
    }

    return result;
  }

  private mapToCredentialInfo(key: ExchangeKey, decryptedSecret: string): CredentialInfo {
    return {
      id: (key._id as DbTypes.ObjectId).toHexString(), // convert mongo id to string
      userId: key.userId,
      exchangeName: key.exchange,
      keyName: key.name,
      valid: key.valid,
      lastHealthCheck: key.lastHealthCheck,
      error: key.error,
      credentials: {
        apiKey: key.publicKey,
        secret: decryptedSecret,
        password: key.password,
        subAccountName: key.subAccountName,
      },
    };
  }
}
