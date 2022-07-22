import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { OperationType } from "../../entities/Statement";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { User } from "../../../users/entities/User";

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();

const createStatementUseCase = new CreateStatementUseCase(
  usersRepository,
  statementsRepository
);

let user: User;

beforeAll(async () => {
  user = await usersRepository.create({
    email: "teste@gmail.com",
    name: "nome lindo",
    password: "senha qualquer",
  });
});

describe("TEST createStatementUseCase business logic", () => {
  test("expect to throw error, since user does not exist", async () => {
    const paramWithInvalidUser = {
      user_id: "invalid",
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "any",
    };
    await expect(
      async () => await createStatementUseCase.execute(paramWithInvalidUser)
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  test("expect to throw error, since user does not have funds to withdraw", async () => {
    const params = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "any",
    } as ICreateStatementDTO;

    await expect(
      async () => await createStatementUseCase.execute(params)
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  test("expect to create operation of withdraw", async () => {
    const paramsWithdraw = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "any",
    } as ICreateStatementDTO;

    const paramsDeposit = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any",
    } as ICreateStatementDTO;

    await statementsRepository.create(paramsDeposit);

    const operation = await createStatementUseCase.execute(paramsWithdraw);

    expect(operation).toMatchObject({
      user_id: user.id,
      type: paramsWithdraw.type,
      amount: paramsWithdraw.amount,
      description: paramsWithdraw.description,
    });
  });

  test("expect to create operation of deposit", async () => {
    const params = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: "any",
    } as ICreateStatementDTO;

    const operation = await createStatementUseCase.execute(params);

    expect(operation).toMatchObject({
      user_id: user.id,
      type: params.type,
      amount: params.amount,
      description: params.description,
    });
  });
});
