import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

describe("Create User", () => {

  let createUser: CreateUserUseCase;
  let repository: IUsersRepository;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(repository);
  });

  it("should be able to create a user", async () => {
    const newUser = {
      name: 'User 1',
      email: 'user_1@test.com',
      password: '123456789'
    }

    await createUser.execute(newUser);

    const existing = repository.findByEmail(newUser.email);

    expect(existing).toBeDefined();
  });

  it("should not be able to create a user with an already registered email", async () => {
    await expect(async () => {
      const newUser1 = {
        name: 'User 2',
        email: 'user_1@test.com',
        password: '123456789'
      }

      const newUser2 = {
        name: 'User 2',
        email: 'user_1@test.com',
        password: '12345sdfasd'
      }

      await createUser.execute(newUser1);
      await createUser.execute(newUser2);
    }).rejects.toBeInstanceOf(CreateUserError);
  })

});