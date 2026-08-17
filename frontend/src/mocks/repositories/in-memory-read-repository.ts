import type { EntityId } from "@/types/common";
import type { ReadRepository } from "@/services/contracts/read-repository";

type Identifiable = Readonly<{ id: EntityId }>;

export class InMemoryReadRepository<
  TEntity extends Identifiable,
> implements ReadRepository<TEntity> {
  constructor(private readonly records: readonly TEntity[]) {}

  async list(): Promise<readonly TEntity[]> {
    return this.records;
  }

  async getById(id: EntityId): Promise<TEntity | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }
}
