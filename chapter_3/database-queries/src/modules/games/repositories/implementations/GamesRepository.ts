import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return this.repository
      .createQueryBuilder("game")
      .where("game.title ILIKE :param", { param: `%${param}%` })
      .getMany();
  }

  async countAllGames(): Promise<[{ count: string }]> {
    return this.repository.query("SELECT COUNT(1) FROM games");
  }

  async findUsersByGameId(id: string): Promise<User[]> {
    const game = await this.repository
      .createQueryBuilder("game")
      .leftJoinAndSelect("game.users", "user")
      .where("game.id = :id", { id })
      .getOne();

    return game ? game.users : [];
  }
}
