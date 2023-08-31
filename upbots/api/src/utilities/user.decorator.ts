import { createParamDecorator, ExecutionContext } from "@nestjs/common"; // since nestjs v7

const UserFromJWT = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
export default UserFromJWT;
