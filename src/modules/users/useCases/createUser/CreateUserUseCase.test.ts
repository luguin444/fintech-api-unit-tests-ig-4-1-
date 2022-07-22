import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

const usersRepository = new InMemoryUsersRepository();
const createUserUseCase = new CreateUserUseCase(usersRepository);

const userData = {
  name: "meu nome de teste 2",
  email: "email@teste.com",
  password: "1234",
};

// jest.spyOn(usersRepository, "create").mockImplementation(jest.fn());

describe("TEST CreateUsersUseCase business logic", () => {
  test("useris created and returned with correct data", async () => {
    const userData = {
      name: "meu nome de teste",
      email: "email@teste.com",
      password: "1234",
    };
    const user = await createUserUseCase.execute(userData);

    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
        password: expect.any(String),
      })
    );
    expect(user.password).not.toEqual(userData.password);
  });

  test("expect to throw error, since user email already exists", async () => {
    const userData = {
      name: "meu nome de teste 2",
      email: "email@teste.com",
      password: "1234",
    };

    expect(
      async () => await createUserUseCase.execute(userData)
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
