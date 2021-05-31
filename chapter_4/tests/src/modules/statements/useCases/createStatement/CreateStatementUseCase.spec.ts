import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statements", () => {
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let createUser: CreateUserUseCase;
  let createStatement: CreateStatementUseCase;
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository;
    statementsRepository = new InMemoryStatementsRepository;
    createUser = new CreateUserUseCase(usersRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);

    user = await createUser.execute({
      name: 'User 1',
      email: 'user_1@test.com',
      password: '123456789'
    })

  })

  it("should be able to make a deposit", async () => {
    const operation = {
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit test"
    };

    const statement = await createStatement.execute(operation)

    expect(statement).toEqual(expect.objectContaining({
      id: expect.any(String),
      ...operation
    }));
  });

  it("should be able to make a withdraw when fund are sufficient", async () => {
    const operation = {
      user_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "withdraw test"
    };

    await createStatement.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit test"
    })

    const statement = await createStatement.execute(operation)

    expect(statement).toEqual(expect.objectContaining({
      id: expect.any(String),
      ...operation
    }));
  });

  it("should not be able to make a operation for a non-existing user", async () => {
    await expect(async () => {
      await createStatement.execute({
        user_id: "some_non_existing_id",
        type: OperationType.DEPOSIT,
        amount: 20,
        description: "deposit test for non existing user"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to make a withdraw when fund are insufficient", async () => {
    await expect(async () => {
      await createStatement.execute({
        user_id: user.id!,
        type: OperationType.DEPOSIT,
        amount: 20,
        description: "deposit test"
      })

      await createStatement.execute({
        user_id: user.id!,
        type: OperationType.WITHDRAW,
        amount: 50,
        description: "withdraw test"
      });

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

})