import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { User } from "../../../users/entities/User";
import { OperationType, Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

type paramsUseCase = {
  user_id: string;
  statement_id: string;
};

const usersRepository = new InMemoryUsersRepository();
const statementsRepository = new InMemoryStatementsRepository();

const getStatementOperationUseCase = new GetStatementOperationUseCase(
  usersRepository,
  statementsRepository
);

let user: User;
let operation: Statement;

beforeAll(async () => {
  user = await usersRepository.create({
    email: "teste@gmail.com",
    name: "nome lindo",
    password: "senha qualquer",
  });

  operation = await statementsRepository.create({
    amount: 100,
    description: "any",
    type: OperationType.DEPOSIT,
    user_id: user.id,
  } as ICreateStatementDTO);
});

describe("TEST getStatementOperationUseCase business logic", () => {
  test("expect to throw error, since user does not exist", async () => {
    const paramWithInvalidUser = {
      user_id: "invalid",
      statement_id: "any",
    };
    await expect(
      async () =>
        await getStatementOperationUseCase.execute(paramWithInvalidUser)
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  test("expect to throw error, since statement does not exist", async () => {
    const paramWithInvalidStatement = {
      user_id: user.id,
      statement_id: "invalid One",
    } as paramsUseCase;

    await expect(
      async () =>
        await getStatementOperationUseCase.execute(paramWithInvalidStatement)
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  test("expect to throw error, since statement does not exist", async () => {
    const paramWithInvalidStatement = {
      user_id: user.id,
      statement_id: operation.id,
    } as paramsUseCase;

    const operationReturn = await getStatementOperationUseCase.execute(
      paramWithInvalidStatement
    );

    expect(operationReturn).toMatchObject({
      user_id: user.id,
      type: operation.type,
      amount: operation.amount,
      description: operation.description,
    });
  });
});
