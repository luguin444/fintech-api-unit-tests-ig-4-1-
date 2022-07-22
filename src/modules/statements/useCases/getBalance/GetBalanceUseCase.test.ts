import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { User } from "../../../users/entities/User";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../entities/Statement";

const usersRepository = new InMemoryUsersRepository();
const statementRepository = new InMemoryStatementsRepository();
const getBalanceUseCase = new GetBalanceUseCase(
  statementRepository,
  usersRepository
);

let user: User;
const userData = {
  name: "meu nome de teste",
  email: "email@teste.com",
  password: "senha maravilhosa",
};

beforeAll(async () => {
  user = await usersRepository.create(userData);
  const depositStatement = await statementRepository.create({
    user_id: user.id as string,
    description: "descrição de teste",
    amount: 400,
    type: OperationType.DEPOSIT,
  });

  const withdrawStatement = await statementRepository.create({
    user_id: user.id as string,
    description: "descrição de teste",
    amount: 300,
    type: OperationType.WITHDRAW,
  });
});

describe("TEST ShowUserProfileUseCase business logic", () => {
  test("session created and returned with correct data", async () => {
    const invalid_id = "id invalid";

    await expect(async () => {
      await getBalanceUseCase.execute({ user_id: invalid_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  test("balance successufully returned with correct data", async () => {
    const userIdCreated = user.id as string;
    const balance = await getBalanceUseCase.execute({
      user_id: userIdCreated,
    });

    expect(balance).toMatchObject({
      balance: 400 - 300,
    });
    expect(balance).toHaveProperty("statement");
  });
});
