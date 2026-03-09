import { Column, eq } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

import { getDb } from "@/db/userDb";

type IdTable = PgTable & { userId: Column; id: Column };

export class BaseRepository<T extends IdTable> {
  constructor(
    private _table: T,
    private _idCol: T["id"],
  ) {}

  async getAll() {
    return (await getDb()).select(this._table);
  }

  async getById(id: string) {
    const [row] = await (await getDb()).select(this._table, eq(this._idCol, id));
    return row;
  }

  async create(data: Record<string, unknown>) {
    await (await getDb()).insert(this._table, data);
    return (await this.getById(data.id as string))!;
  }

  async update(id: string, data: Record<string, unknown>) {
    await (await getDb()).update(this._table, data, eq(this._idCol, id));
    return (await this.getById(id))!;
  }

  async delete(id: string) {
    await (await getDb()).delete(this._table, eq(this._idCol, id));
  }
}
