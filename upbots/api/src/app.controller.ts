import { Controller, Get, Req, Logger, Res, HttpStatus } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
// import { MailService } from './shared/mail.service';
import { Response, Request } from "express";
import AppService from "./app.service";
import UserService from "./shared/user.service";

@Controller()
export default class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService, // private readonly mailService: MailService,
    private userService: UserService
  ) {}

  @Get()
  @ApiOperation({
    summary: "api main health check",
    description: `Returns ok and date`,
  })
  getApiHealth(@Req() request: Request) {
    this.logger.log("GET api/  health check");
    this.logger.debug(`Request headers: ${request.headers}`);
    const ip = request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    return { health: "ok", date: new Date(), ip }; // this.appService.getHello();
  }

  @Get("/db")
  async getDbHealth(@Res() res: Response) {
    this.logger.log("GET api/db (getDbHealth)");

    let dbOK = true;
    try {
      await this.userService.findUser("api_health_check@local.test");
    } catch (err) {
      dbOK = false;
      this.logger.error(err, err.stack);
    }
    if (dbOK) {
      res.status(HttpStatus.OK).json({ db: { status: "OK" } });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ db: { status: "NOT_OK" } });
    }
  }

  @Get("hello")
  sayHello(): string {
    return this.appService.getHello();
  }

  // @Get('emailtest')
  // async getEmailtest() {
  //   await this.mailService.sendVerificationEmail({} as User);
  //   return { health: 'ok', date: new Date() }; // this.appService.getHello();
  // }
}
