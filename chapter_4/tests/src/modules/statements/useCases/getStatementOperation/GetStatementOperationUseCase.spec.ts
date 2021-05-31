import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement Operation", () => {
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let createUser: CreateUserUseCase;
  let createStatement: CreateStatementUseCase;
  let getStatement: GetStatementOperationUseCase
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository;
    statementsRepository = new InMemoryStatementsRepository;
    createUser = new CreateUserUseCase(usersRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);
    getStatement = new GetStatementOperationUseCase(usersRepository, statementsRepository);

    user = await createUser.execute({
      name: 'User 1',
      email: 'user_1@test.com',
      password: '123456789'
    });
  })

  it("should be able to get an existing statement of an user", async () => {
    const operation = {
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit test"
    };

    const newStatement = await createStatement.execute(operation);
    const statement = await getStatement.execute({
      user_id: user.id!,
      statement_id: newStatement.id!
    })

    expect(statement).toEqual(newStatement);
  })

  it("should not be able to get an statement of a non-existing user", async () => {

    const operation = {
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit test"
    };

    const statement = await createStatement.execute(operation);

    await expect(async () => {
      await getStatement.execute({
        user_id: "some_non_existing_id",
        statement_id: statement.id!
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a non-existing statement of an user", async () => {
    await expect(async () => {
      await getStatement.execute({
        user_id: user.id!,
        statement_id: "some_non_existing_id"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

})