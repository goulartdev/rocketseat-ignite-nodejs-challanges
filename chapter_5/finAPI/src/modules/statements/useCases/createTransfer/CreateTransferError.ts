import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class InvalidAmount extends AppError {
    constructor() {
      super('Amount must be greater than zero', 400);
    }
  }

  export class CantTransferToYourself extends AppError {
    constructor() {
      super("Can't transfer to yourself", 400);
    }
  }
}
