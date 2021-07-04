import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {

  }

  async execute({ user_id, sender_id, amount, description }: ICreateTransferDTO): Promise<Statement> {

    if (amount <= 0) {
      throw new CreateTransferError.InvalidAmount();
    }

    if (! await this.userExists(sender_id)) {
      throw new CreateTransferError.UserNotFound();
    }

    if (sender_id === user_id) {
      throw new CreateTransferError.CantTransferToYourself();
    }

    if (! await this.userExists(user_id)) {
      throw new CreateTransferError.UserNotFound();
    }

    if (await this.isFundsInsufficient(sender_id, amount)) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statement = new Statement();

    Object.assign(statement, {
      user_id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFER
    })

    return this.statementsRepository.create(statement);
  }

  async userExists(userId: string): Promise<Boolean> {
    const user = await this.usersRepository.findById(userId);

    return !!user;
  }

  async isFundsInsufficient(userId: string, amount: number): Promise<boolean> {
    const { balance } = await this.statementsRepository.getUserBalance({ user_id: userId, with_statement: false });

    return amount > balance
  }
}

export default CreateTransferUseCase;