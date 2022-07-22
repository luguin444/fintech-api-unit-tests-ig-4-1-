import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../../entities/User";

const usersRepository = new InMemoryUsersRepository();
const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

const mockCompareBcrypt = jest.spyOn(bcrypt, "compare");
const fakeToken = "meu token";
const mockSignJWT = jest
  .spyOn(jsonwebtoken, "sign")
  .mockImplementationOnce(() => fakeToken);

let user: User;
const userData = {
  name: "meu nome de ",
  email: "email@teste.com",
  password: "senha maravilhosa",
};

beforeAll(async () => {
  user = await usersRepository.create(userData);
});

describe("TEST AuthenticateUserUseCase business logic", () => {
  test("session created and returned with correct data", async () => {
    mockCompareBcrypt.mockImplementationOnce(async () => true);
    mockSignJWT.mockImplementationOnce(() => fakeToken);

    const sessionReturn = await authenticateUserUseCase.execute({
      email: userData.email,
      password: userData.password,
    });

    expect(sessionReturn).toMatchObject({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: fakeToken,
    });
  });

  test("expect to throw incorrectEmailOrPasswordError, since email does not exists", async () => {
    await expect(
      async () =>
        await authenticateUserUseCase.execute({
          email: "wrong email",
          password: "senha qualquer",
        })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  test("expect to throw incorrectEmailOrPasswordError, since password is mocked as wrong", async () => {
    mockCompareBcrypt.mockImplementationOnce(async () => false);
    const userCreated = await usersRepository.findByEmail(userData.email);

    await expect(
      async () =>
        await authenticateUserUseCase.execute({
          email: userData.email,
          password: "wrong password, since bcrypt was mocked in L60",
        })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    expect(userCreated).toEqual(user);
  });
});
