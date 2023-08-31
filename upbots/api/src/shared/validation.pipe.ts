/* eslint-disable no-plusplus */
import { ValidationPipe, ValidationError, UnprocessableEntityException } from "@nestjs/common";

/**
 * returns a 422 in case of validation error.
 */
const validationPipe = new ValidationPipe({
  exceptionFactory: (errors: ValidationError[]) => {
    const erroDetails = errors
      .map((err) => {
        const rules = Object.keys(err.constraints);

        for (let i = 0; i < rules.length; i++) {
          const prop = rules[i];
          // Logger.debug(`err prop: ${prop} err.constraints[prop] ${err.constraints[prop]}`);
          return err.constraints[prop];
        }
        return "";
      })
      .join(", ");
    return new UnprocessableEntityException(errors, `Validation error - ${erroDetails}`);
  },
});
export default validationPipe;
