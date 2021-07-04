import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTransferError";
import CreateTransferUseCase from "./CreateTransferUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createUser: CreateUserUseCase;
let createStatemet: CreateStatementUseCase;
let createTransfer: CreateTransferUseCase;
let user1: User;
let user2: User;

describe("Create transference statement", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUser = new CreateUserUseCase(usersRepository);
    createTransfer = new CreateTransferUseCase(usersRepository, statementsRepository);
    createStatemet = new CreateStatementUseCase(usersRepository, statementsRepository);

    user1 = await createUser.execute({
      name: 'User Test Transfer 1',
      email: 'user.transfer.1@test.com.br',
      password: 'somestrongpassword'
    });

    user2 = await createUser.execute({
      name: 'User Test Transfer 2',
      email: 'user.transfer.2@test.com.br',
      password: 'somestrongpassword'
    });

    await createStatemet.execute({
      user_id: user1.id!,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "TEST DEPOSIT FOR TRANSFER"
    })

  });

  it("should be able to create a transference statement", async () => {
    const params = {
      user_id: user2.id!,
      sender_id: user1.id!,
      amount: 400,
      description: 'TEST TRANSFER'
    }

    const statement = await createTransfer.execute(params);

    expect(statement).toEqual(expect.objectContaining({
      id: expect.any(String),
      type: OperationType.TRANSFER,
      ...params,
    }));

  });

  it("should not be able to transfer to an non existing user", async () => {
    const params = {
      user_id: 'some-non-existing-user-id',
      sender_id: user1.id!,
      amount: 1,
      description: 'TEST TRANSFER'
    }

    await expect(createTransfer.execute(params)).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("should not be able to transfer to an non existing user", async () => {
    const params = {
      user_id: user2.id!,
      sender_id: 'some-non-existing-user-id',
      amount: 1,
      description: 'TEST TRANSFER'
    }

    await expect(createTransfer.execute(params)).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("should not be able to transfer if funds are insufficients", async () => {
    const params = {
      user_id: user1.id!,
      sender_id: user2.id!,
      amount: 1000,
      description: 'TEST TRANSFER'
    }

    await expect(createTransfer.execute(params)).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });

  it("should not be able to transfer if amount isn't greater than 0", async () => {
    const params = {
      user_id: user1.id!,
      sender_id: user2.id!,
      amount: -1,
      description: 'TEST TRANSFER'
    }

    await expect(createTransfer.execute(params)).rejects.toBeInstanceOf(CreateTransferError.InvalidAmount);
  });

  it("should not de able to transfer to yourself", async () => {
    const params = {
      user_id: user1.id!,
      sender_id: user1.id!,
      amount: 1,
      description: 'TEST TRANSFER'
    }

    await expect(createTransfer.execute(params)).rejects.toBeInstanceOf(CreateTransferError.CantTransferToYourself);
  });
})