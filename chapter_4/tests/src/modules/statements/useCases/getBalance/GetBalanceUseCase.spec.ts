import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get User Balance", () => {

  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let createUser: CreateUserUseCase;
  let createStatement: CreateStatementUseCase;
  let getBalance: GetBalanceUseCase;
  let user: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository;
    statementsRepository = new InMemoryStatementsRepository;
    createUser = new CreateUserUseCase(usersRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);
    getBalance = new GetBalanceUseCase(statementsRepository, usersRepository);

    user = await createUser.execute({
      name: 'User 1',
      email: 'user_1@test.com',
      password: '123456789'
    })
  })

  it("should be able to get the statements of an existing user", async () => {
    await createStatement.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit test"
    });

    await createStatement.execute({
      user_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 60,
      description: "withdraw test"
    });

    const { balance } = await getBalance.execute({ user_id: user.id! });

    expect(balance).toEqual(40);
  });

  it("should not be able to get the statements of an non-existing user", async () => {
    await expect(async () => {
      await getBalance.execute({ user_id: "some_non_existing_id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

})