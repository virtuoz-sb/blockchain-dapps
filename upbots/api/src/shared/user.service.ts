/* eslint-disable no-underscore-dangle */

import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcryptjs";
import { Model, Types as DbTypes } from "mongoose";

import UserSettingsRepository from "../usersettings/repositories/usersettings.repository";
import { UserRolesDto } from "../auth/account/UserRolesDto";
import { CredentialsDTO, RegisterDTO, NewPasswordDTO } from "../auth/auth.dto";
import { User, UserDto, UserIdentity, UserForUpdateDto, AuthProvider } from "../types/user";
import MailService from "./mail.service";
import StakingLevelService from "../staking-level/services/staking-level.service";
import UserEmailCodeGeneration from "../models/user.hook";

@Injectable()
export default class UserService {
  // private readonly logger = new Logger(UserService.name);

  // @InjectModel('User') goes in pair with MongooseModule.forFeature() in shared.module.ts
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    private mailService: MailService,
    private stakingLevelService: StakingLevelService,
    private userSettingService: UserSettingsRepository
  ) {}

  async sendVerifyEmailLink(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).select("email password firstname passwordReset verification");

    if (!user) {
      return true;
    }
    if (!user.verification.emailVerified) {
      await this.resendEmail(user.email, user.email, user.password);
    }

    return true;
  }

  async sendRecoverLink(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).select("email password firstname passwordReset verification");

    if (!user) {
      return true;
    }
    if (!user.verification.emailVerified) {
      const expiry = new Date();
      if (user.verification.codeExpiration < expiry) {
        await this.resendEmail(user.email, user.email, user.password);
        throw new HttpException("email has not been validated, new activation code sent", HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException("email has not been validated", HttpStatus.FORBIDDEN);
      }
    }

    const expiry = new Date();
    user.passwordReset = {
      code: await UserEmailCodeGeneration(),
      codeExpiration: expiry,
    };
    await user.save();
    await this.mailService.sendResetPassword(user);
    return true;
  }

  async recoverPassword(code: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel
      .findOne({ "passwordReset.code": code })
      .select("email password passwordModifiedCount passwordModified passwordReset created");

    if (!user) {
      throw new HttpException("code not valid", HttpStatus.BAD_REQUEST);
    }

    const expiry = new Date();
    const seconds = (expiry.getTime() - user.passwordReset.codeExpiration.getTime()) / 1000;

    if (seconds > 900) {
      throw new HttpException("This code has expired request another one", HttpStatus.BAD_REQUEST);
    }
    user.password = newPassword;
    user.passwordModified = new Date();
    user.passwordModifiedCount += 1;
    user.passwordReset = null;
    await user.save();

    return true;
  }

  async resendEmail(email: string, emailUsedToRegister: string, password: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email: emailUsedToRegister }).select("email password firstname verification created");

    if (!user) {
      throw new HttpException("user not valid", HttpStatus.FORBIDDEN);
    }

    if (user.authProvider === "LOCAL" && (await bcrypt.compare(password, user.password))) {
      if (password !== user.password) {
        throw new HttpException("password not valid", HttpStatus.FORBIDDEN);
      }
    }

    if (user.verification.emailVerified) {
      return this.mapToDto(user);
    }
    if (email !== emailUsedToRegister) {
      user.email = email;
    }
    // check if it is not a spam

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    const seconds = (expiry.getTime() - user.verification.codeExpiration.getTime()) / 1000;
    if (seconds < 60) {
      throw new HttpException("You should wait before asking for another email to be sent", HttpStatus.BAD_REQUEST);
    }
    user.verification.code = await UserEmailCodeGeneration();
    user.verification.codeExpiration = expiry;
    await user.save();
    await this.mailService.sendVerificationEmail(user);
    return this.mapToDto(user);
  }

  async create(userDTO: RegisterDTO): Promise<UserDto> {
    // const { username } = userDTO;
    const { email } = userDTO;
    const findEmailRegExp = `^${userDTO.email}$`;
    const userMatch = await this.userModel.find({ email: { $regex: findEmailRegExp, $options: "i" } });
    let userAlreadyExists: boolean = userMatch.length > 0;
    if (!userAlreadyExists) {
      const user = await this.userModel.findOne({ email });
      userAlreadyExists = !!user;
    }
    if (userAlreadyExists) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    // eslint-disable-next-line new-cap
    const createdUser = new this.userModel(userDTO);
    // distinguish validation error from a technical error
    try {
      await createdUser.validate();
    } catch (e) {
      throw new UnprocessableEntityException("User is invalid"); // HTTP 422
    }
    try {
      await createdUser.save();
    } catch (e) {
      throw new InternalServerErrorException("Could not create user");
    }

    // Set Default User Settings
    await this.userSettingService.setUserDefaultSetting(createdUser.id);

    await this.mailService.sendVerificationEmail(createdUser);

    return this.mapToDto(createdUser);
  }

  // async find() {
  //   return await this.userModel.find();
  // }

  /*
   * Checks database wether user exists and password matches.
   * Returns a user document or throws an HttpException.
   * @param userDTO
   */
  async validateCredentials(userDTO: CredentialsDTO): Promise<string> {
    const { email, password } = userDTO;
    const userMatch = await this.userModel.find({ email }).select("email password authProvider created");
    if (userMatch.length === 1 && email !== userMatch[0].email) {
      // if 0 -> nothing
      // if > 1 -> duplicates
      // if == 1 -> single user, we replace the email entered with the one entered if case is different
      if (await bcrypt.compare(password, userMatch[0].password)) {
        return userMatch[0].email;
      }
    } else {
      const user = await this.userModel.findOne({ email }).select("email password authProvider created");
      if (!user) {
        throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
      }
      if (user.authProvider === "GOOGLE") {
        throw new HttpException(
          "This account appears to be a Google Account without a password. Try using the Log in with Google button",
          HttpStatus.UNAUTHORIZED
        );
      }
      if (user.authProvider === "FACEBOOK") {
        throw new HttpException(
          "This account appears to be a Facebook Account without a password. Try using the Log in with Facebook button",
          HttpStatus.UNAUTHORIZED
        );
      }
      if (user.authProvider === "LOCAL" && (await bcrypt.compare(password, user.password))) {
        return user.email;
      }
    }
    throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
  }

  async deleteUser(email: string): Promise<boolean> {
    try {
      await this.userModel.deleteOne({ email });
    } catch (e) {
      return false;
    }
    return true;
  }

  async findUser(email: string): Promise<UserIdentity> {
    // const { username } = payload;
    return this.mapToIdentity(await this.userModel.findOne({ email }));
  }

  async findUserById(id: string): Promise<UserIdentity> {
    return this.mapToIdentity(await this.userModel.findById(id));
  }

  async findUserDto(email: string): Promise<UserDto> {
    // const { username } = payload;
    return this.mapToDto(await this.userModel.findOne({ email }));
  }

  async setEmailAsVerified(code: string): Promise<boolean> {
    const user = await this.userModel.findOne({ "verification.code": code });
    if (!user) {
      return false;
    }
    if (!user.verification.emailVerified) {
      const now = new Date();
      if (now > user.verification.codeExpiration) {
        throw new BadRequestException("verification code expired");
      }
      user.verification.emailVerified = true;
      await user.save();
    }
    return true;
  }

  async updateUserPassword(newp: NewPasswordDTO, user: User, userInfo: any): Promise<boolean> {
    const u = await this.userModel.findOne({ email: newp.email }).select("password passwordModifiedCount authProvider");
    if (!u) {
      return false;
    }
    if (u.authProvider === AuthProvider.LOCAL && !(await bcrypt.compare(newp.password, u.password))) {
      throw new HttpException("password not valid", HttpStatus.FORBIDDEN);
    }
    if (newp.newPassword !== newp.repeatNewPassword) {
      throw new HttpException("newpassword verification is not the same", HttpStatus.BAD_REQUEST);
    }
    if (u) {
      u.authProvider = AuthProvider.LOCAL;
      u.password = newp.newPassword;
      u.passwordModified = new Date();
      const cnt = u.passwordModifiedCount ? u.passwordModifiedCount : 0;
      u.passwordModifiedCount = cnt + 1;
      await u.save();

      await this.mailService.sendPasswordResetNotif(user, userInfo);
    }
    return true;
  }

  async getTotpSecret(email: string): Promise<string> {
    const u = await this.userModel.findOne({ email }).select("totpRequired twoFactorTempSecret twoFactorSecret");
    if (u) {
      if (u.twoFactorSecret) {
        return u.twoFactorSecret;
      }
      return u.twoFactorTempSecret;
    }
    return null;
  }

  /*  async enableTotp(email: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select('totpRequired');
    if (!u) {
      return false;
    }
    if (!u.totpRequired) {
      u.totpRequired = true;
      try {
        await u.save();
      } catch (e) {
        return false;
      }
    }
    return true;
  } */
  async disableTotp(email: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select("totpRequired twoFactorTempSecret twoFactorSecret");
    if (!u) {
      return false;
    }
    if (u.totpRequired) {
      u.totpRequired = false;
      u.twoFactorTempSecret = null;
      u.twoFactorSecret = null;
      try {
        await u.save();
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  async isTotpActivatedAndVerified(email: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select("totpRequired twoFactorTempSecret twoFactorSecret");
    if (!u) {
      throw new HttpException("user not found", HttpStatus.NOT_FOUND);
    }
    if (u.totpRequired) {
      // 2FA implicit activation check : 2FA activated when twoFactorSecret is set (not twoFactorTempSecret)
      if (u.twoFactorSecret && u.twoFactorSecret.length > 42) {
        return true;
      }
      return false;
    }
    return false;
  }

  async verifyReset2faCode(email: string, code: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select("reset2faCode is2faDisabled");
    if (!u) {
      throw new HttpException("user not found", HttpStatus.NOT_FOUND);
    }
    if (u.is2faDisabled) {
      // 2FA implicit activation check : 2FA activated when twoFactorSecret is set (not twoFactorTempSecret)
      if (code === u.reset2faCode) {
        return true;
      }
      throw new HttpException("Invalid reset code.", HttpStatus.FORBIDDEN);
    }
    throw new HttpException("Please request reset 2fa code.", HttpStatus.FORBIDDEN);
  }

  async clearReset2faCode(email: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select("reset2faCode is2faDisabled");
    if (!u) {
      return false;
    }
    if (u.is2faDisabled) {
      u.is2faDisabled = false;
      u.reset2faCode = null;
      try {
        await u.save();
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  /**
   * set totp secret in db
   * @param secret secret to be recorded in the db
   * @param email email of the user in the db
   * @param isTemp if true the secret is stored as temporary secret
   */
  async setTotpSecret(secret: string, email: string, isTemp: boolean): Promise<boolean> {
    const u = await this.userModel.findOne({ email }).select("totpRequired twoFactorTempSecret twoFactorSecret");
    if (!u) {
      return false;
    }
    if (secret) {
      if (u.twoFactorTempSecret) {
        // it means we have generated a secret already and verified the token
        // we use isTemp as a second way to check that we intend to set the secret as final
        if (u.twoFactorTempSecret === secret && !isTemp && !u.twoFactorSecret) {
          u.twoFactorSecret = secret;
          u.totpRequired = true;
        } else {
          u.twoFactorTempSecret = secret;
        }
      } else {
        u.twoFactorTempSecret = secret;
        u.totpRequired = false;
      }
      try {
        await u.save();
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  async updateUser(payload: UserForUpdateDto, email: string): Promise<{ user: UserIdentity }> {
    const u = await this.userModel.findOne({ email }).select("firstname password telegram tgChatId lastname phone emailVerified");
    // FIXME it should throw
    // controller should catch and return null
    if (!u) {
      return { user: null };
    }
    if (payload) {
      if (!(await bcrypt.compare(payload.password, u.password))) {
        throw new BadRequestException("update denied");
      }
      if (payload.firstname) {
        u.firstname = payload.firstname;
      }
      if (payload.telegram) {
        u.telegram = payload.telegram;
      }
      if (payload.tgChatId) {
        u.tgChatId = payload.tgChatId;
      }
      if (payload.lastname) {
        u.lastname = payload.lastname;
      }
      if (payload.phone) {
        u.phone = payload.phone;
      }
      if (payload.homeAddress) {
        u.homeAddress = payload.homeAddress;
      }
      if (payload.city) {
        u.city = payload.city;
      }
      if (payload.country) {
        u.country = payload.country;
      }
      if (payload.aboutMe) {
        u.aboutMe = payload.aboutMe;
      }
      await u.save();
    }
    const res = { user: this.mapToIdentity(u) };
    return res;
  }

  async updateUserPicture(file: any, email: string): Promise<{ status: string; data: string; mimetype: string }> {
    const u = await this.userModel.findOne({ email });
    if (!u) {
      return { status: "failed", data: "user not found", mimetype: null };
    }
    if (file) {
      u.picture.mimetype = file.mimetype;
      u.picture.data = file.buffer.toString("base64");
      await u.save();
    }
    return {
      status: "success",
      data: u.picture.data,
      mimetype: u.picture.mimetype,
    };
  }

  async updateUserWallets(payload: Partial<UserForUpdateDto>, email: string): Promise<void> {
    const u = await this.userModel.findOne({ email }).select("custodialWallets");

    if (!u) {
      throw new NotFoundException("User not found");
    }

    if (payload.custodialWallets) {
      u.custodialWallets = { ...u.custodialWallets, ...payload.custodialWallets };
    }

    await u.save();
  }

  async getUbxtStakingAmount(email: string): Promise<{ ubxtStakingAmount: number; botsAccess: boolean }> {
    const u = await this.userModel.findOne({ email }).select("ubxtStakingAmount botsAccess");
    if (!u) {
      throw new NotFoundException("User not found");
    }
    return {
      ubxtStakingAmount: u.ubxtStakingAmount || 0,
      botsAccess: u.botsAccess,
    };
  }

  async updateUbxtStakingAmount(email: string, ubxtStakingAmount: number, walletAddress: string): Promise<boolean> {
    const u = await this.userModel.findOne({ email });
    if (!u) {
      throw new NotFoundException("User not found");
    }
    u.ubxtStakingAmount = ubxtStakingAmount;
    if (ubxtStakingAmount >= 2500) {
      u.botsAccess = true;
    }
    await u.save();
    // update staking level data
    this.stakingLevelService.checkAndAwardPrizeByUser(u.id, ubxtStakingAmount, walletAddress);
    return true;
  }

  async updateUserRole(payload: UserRolesDto): Promise<boolean> {
    const u = await this.userModel.findOne({ _id: payload.userId });
    if (!u) {
      throw new NotFoundException("User not found");
    }
    u.roles = payload.roles;
    await u.save();
    return true;
  }

  async reset2faEmail(email: string, code: string, userInfo: any) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    user.reset2faCode = code;
    user.is2faDisabled = true;
    await user.save();
    await this.mailService.sendReset2faCode(user, userInfo);
    return true;
  }

  private mapToDto(user: User): UserDto {
    // const sanitized = user.toObject();
    // delete sanitized['password'];
    // return sanitized;

    return {
      _id: user._id,
      created: user.created,
      email: user.email,
      firstname: user.firstname,
      telegram: user.telegram,
      tgChatId: user.tgChatId,
      tgChatIdDraft: user.tgChatIdDraft,
      tgConfirmCode: user.tgConfirmCode,
      lastname: user.lastname,
      phone: user.phone,
      homeAddress: user.homeAddress,
      country: user.country,
      city: user.city,
      aboutMe: user.aboutMe,
      roles: user.roles,
      picture: user.picture,
      emailVerified: user.verification.emailVerified,
      totpRequired: user.totpRequired,
      custodialWallets: user.custodialWallets,
      authProvider: user.authProvider,
    };
  }

  private mapToIdentity(user: User): UserIdentity {
    if (!user) {
      return null;
    }
    // eslint-disable-next-line no-underscore-dangle
    const dbId = user._id as DbTypes.ObjectId;
    const res: UserIdentity = {
      id: dbId.toHexString(),
      idFromDb: dbId,
      ...this.mapToDto(user),
    };
    return res;
  }
}
