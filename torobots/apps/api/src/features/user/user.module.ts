import { forwardRef, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './service/user.service';
import { UserGateway } from './gateway/user.gateway';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
    UserGateway,
  ],
  exports: [
    UserService,
    UserGateway,
  ],
})
export class UserModule implements OnModuleInit, OnModuleDestroy {
  constructor() {}

  onModuleInit() {
  }

  onModuleDestroy() {
  }

  private deleteConnections() {
  }
}
