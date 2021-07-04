import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import CreateTransferUseCase from "../createTransfer/CreateTransferUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get User Balance", () => {

  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let createUser: CreateUserUseCase;
  let createStatement: CreateStatementUseCase;
  let createTransfer: CreateTransferUseCase;
  let getBalance: GetBalanceUseCase;
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository;
    statementsRepository = new InMemoryStatementsRepository;
    createUser = new CreateUserUseCase(usersRepository);
    createStatement = new CreateStatementUseCase(usersRepository, statementsRepository);
    createTransfer = new CreateTransferUseCase(usersRepository, statementsRepository);
    getBalance = new GetBalanceUseCase(statementsRepository, usersRepository);

    user1 = await createUser.execute({
      name: 'User Test Balance 1',
      email: 'user.balance.1@test.com',
      password: '123456789'
    })

    user2 = await createUser.execute({
      name: 'User Test Balance 2',
      email: 'user.balance.2@test.com.br',
      password: 'somestrongpassword'
    });
  })

  it("should be able to get the statements of an existing user", async () => {
    const amounts = [100, -60, 200, -50];

    await createStatement.execute({
      user_id: user1.id!,
      type: OperationType.DEPOSIT,
      amount: Math.abs(amounts[0]),
      description: "deposit test"
    });

    await createStatement.execute({
      user_id: user1.id!,
      type: OperationType.WITHDRAW,
      amount: Math.abs(amounts[1]),
      description: "withdraw test"
    });

    await createStatement.execute({
      user_id: user2.id!,
      type: OperationType.DEPOSIT,
      amount: Math.abs(amounts[2]),
      description: "deposit test"
    });

    await createTransfer.execute({
      user_id: user1.id!,
      sender_id: user2.id!,
      amount: Math.abs(amounts[2]),
      description: "transfer test"
    });

    await createTransfer.execute({
      user_id: user2.id!,
      sender_id: user1.id!,
      amount: Math.abs(amounts[3]),
      description: "transfer test"
    });

    const { balance } = await getBalance.execute({ user_id: user1.id! });

    const expected = amounts.reduce((acc, val) => acc + val);

    expect(balance).toEqual(expected);
  });

  it("should not be able to get the statements of an non-existing user", async () => {
    await expect(async () => {
      await getBalance.execute({ user_id: "some_non_existing_id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

})