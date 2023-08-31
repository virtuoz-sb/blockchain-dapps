import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";

// Define new constraint that checks the existence of sibling properties
@ValidatorConstraint({ async: false })
class IsNotSiblingOfConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (value) {
      return this.getFailedConstraints(args).length === 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} cannot exist alongside the following defined properties: ${this.getFailedConstraints(args).join(", ")}`;
  }

  getFailedConstraints(args: ValidationArguments) {
    // const validator = new Validator();
    // validator.isDefined(..)
    const filtered = args.constraints.filter((prop) => {
      if (args.object[prop]) {
        return true;
      }
      return false;
    });
    return filtered;
  }
}

// Create Decorator for the constraint that was just created
export function IsNotSiblingOf(props: string[], validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: props,
      validator: IsNotSiblingOfConstraint,
    });
  };
}

/**
 * returns true if exclusive property if NOT defined. Helps determining if a prop should be validated
 * @param incompatibleSiblings list of exclusivity
 */
export function incompatibleSiblingsNotPresent(incompatibleSiblings: string[]) {
  return (o, v) => {
    const b = Boolean(
      v || incompatibleSiblings.every((prop) => !o[prop]) // Validate if prop has value // Validate if all incompatible siblings are not defined
    );
    return b;
  };
}
