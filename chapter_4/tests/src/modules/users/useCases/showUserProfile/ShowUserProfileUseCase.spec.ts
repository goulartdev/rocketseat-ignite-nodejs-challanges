import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let usersRepository: IUsersRepository;
  let createUser: CreateUserUseCase;
  let showProfile: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(usersRepository);
    showProfile = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show an existing user profile", async () => {
    const user = {
      name: "some name",
      email: "some@email.com",
      password: "somepassword"
    }

    const { id } = await createUser.execute(user);
    const profile = await showProfile.execute(id!);

    expect(profile).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: user.name,
      email: user.email
    }));
  });

  it("should not be able to show a non-exisitng user profile", async () => {
    await expect(async () => {
      await showProfile.execute("somenonexistingid");
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });

})