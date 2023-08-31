import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { randomString } from '../../../shared/utils/random-string';
import { UserGateway } from '../gateway/user.gateway';
import { Socket } from 'socket.io';
import { userBlockedFields } from "@torobot/shared"
import { mongoDB, IUser, IUserDocument, userUnpopulatedFields } from "@torobot/shared";

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => UserGateway)) private userGateway: UserGateway,
  ) {}

  async create(body: Partial<IUser>) {
    const user = await mongoDB.Users.create(body);
    await mongoDB.Users.generateSessionToken(user);
    return this.getById(user._id);
  }

  async update(user: IUserDocument, data: UpdateQuery<IUserDocument>) {
    await mongoDB.Users.findByIdAndUpdate(user._id, data);
    return this.getById(user._id);
  }

  getById(id: ObjectId | string) {
    return mongoDB.Users.findById(id);
  }

  async validate(id: string) {
    const user = await this.getById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getByEmail(mail: string) {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };

    return mongoDB.Users.findOne({ email });
  }

  async validateByEmail(email: string) {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getByName(name: string) {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return mongoDB.Users.findOne({ username });
  }

  async validateByName(username: string) {
    const user = await this.getByName(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUser(username: string) {
    return (
      (await this.getByName(username)) ??
      (await this.getByEmail(username))
    );
  }

  getUserBy(filter: FilterQuery<IUserDocument>) {
    return mongoDB.Users.findOne(filter);
  }

  getOnlineUsers() {
    return mongoDB.Users.find({ online: true }).select(userUnpopulatedFields);
  }

  getAll() {
    return mongoDB.Users.find().select(userUnpopulatedFields);
  }

  filterUser(user: IUserDocument, allowedFields: (keyof IUserDocument)[] = []) {
    const userObject = user.toObject({ virtuals: true });

    for (const field of userBlockedFields) {
      if (allowedFields.includes(field)) {
        continue;
      }

      delete userObject[field];
    }

    return userObject;
  }

  async updateUserObject(user: IUserDocument) {
    const newInput = await this.getUser(user._id);

    return Object.assign(user, newInput);
  }

  async generateUsername(base: string) {
    const name = base.replace(/\s/g, '');

    if (!(await this.getByName(name))) {
      return name;
    }

    return this.generateUsername(name + randomString(6));
  }

  async setTotpSecret(secret: string, email: string, isTemp: boolean): Promise<boolean> {
    const u = await this.getUser(email);
    if (!u) {
      return false;
    }
    if (secret) {
      if (u.twoFactorTmpSecret) {
        if (u.twoFactorTmpSecret === secret && !isTemp && !u.twoFactorSecret) {
          u.twoFactorSecret = secret;
          u.totpRequired = true;
        } else {
          u.twoFactorTmpSecret = secret;
        }
      } else {
        u.twoFactorTmpSecret = secret;
        u.totpRequired = false;
      }

      try {
        await u.save();
      } catch {
        return false;
      }
    }
    return true;
  }

  async disableTotp(email: string): Promise<boolean> {
    const u = await this.getUser(email);
    if (!u) {
      return false;
    }
    if (u.totpRequired) {
      u.totpRequired = false;
      u.twoFactorSecret = null;
      u.twoFactorTmpSecret = null;
      try {
        await u.save();
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  sendMessage<T>(user: IUserDocument, event: string, message?: T) {
    return this.userGateway.server.to(`user_${user._id}`).emit(event, message);
  }

  sendMessageExcept<T>(except: Socket, user: IUserDocument, event: string, message: T) {
    return except.broadcast.to(`user_${user._id}`).emit(event, message);
  }
}
