import { Request, Response } from "express";
import { container } from "tsyringe";
import CreateTransferUseCase from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const statement = await createTransfer.execute({
      user_id, sender_id, amount, description
    })

    return response.status(201).json(statement);
  }
}

export default CreateTransferController;