import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { User } from "../../entities/User";

const usersRepository = new InMemoryUsersRepository();
const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

let user: User;
const userData = {
  name: "meu nome de teste",
  email: "email@teste.com",
  password: "senha maravilhosa",
};

beforeAll(async () => {
  user = await usersRepository.create(userData);
});

describe("TEST ShowUserProfileUseCase business logic", () => {
  test("session created and returned with correct data", async () => {
    const invalid_id = "id invalid";

    await expect(async () => {
      await showUserProfileUseCase.execute(invalid_id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

  test("profile successufully returned with correct data", async () => {
    const userIdCreated = user.id as string;
    const userReceived = await showUserProfileUseCase.execute(userIdCreated);

    expect(userReceived).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });
  });
});
