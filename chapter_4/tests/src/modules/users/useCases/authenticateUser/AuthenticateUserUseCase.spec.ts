import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("AUthenticate User", () => {

  let userRepository: IUsersRepository;
  let authenticateUser: AuthenticateUserUseCase;
  let createUser: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    authenticateUser = new AuthenticateUserUseCase(userRepository);
    createUser = new CreateUserUseCase(userRepository);
  })

  it("should be able to authentcate an existing user", async () => {
    const user = {
      name: "some name",
      email: "some@email.com",
      password: "somepassword"
    }

    await createUser.execute(user);

    const response = await authenticateUser.execute(user);

    expect(response).toMatchObject({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        name: user.name,
        email: user.email
      }
    })

  })

  it("should not be able to authenticate an non-existing user", async () => [
    await expect(async () => {
      await authenticateUser.execute({
        email: "some@email.com",
        password: "somepassword"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  ])

  it("should not be able to authenticate with an incorrect password", async () => {
    await expect(async () => {
      const user = {
        name: "some name",
        email: "some@email.com",
        password: "somepassword"
      }

      await createUser.execute(user);

      await authenticateUser.execute({
        email: user.email,
        password: "somewrongpassword"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

})