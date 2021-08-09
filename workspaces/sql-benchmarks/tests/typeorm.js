import typeorm, { EntitySchema } from 'typeorm';

class Item {
  constructor(id, name, value) {
    this.id = id;
    this.name = name;
    this.value = value;
  }
}

const itemSchema = new EntitySchema({
  name: 'Item',
  target: Item,
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: true,
    },
    name: {
      type: 'text',
    },
    value: {
      type: 'int',
      nullable: true,
    },
  },
});

export const setup = async () => {
  const connection = await typeorm.createConnection({
    type: `postgres`,
    url: process.env.PG,
    synchronize: false,
    logging: false,
    entities: [itemSchema],
  });
  const repository = connection.getRepository(Item);

  return {
    name: `TypeORM`,

    async cleanUp() {
      await connection.close();
    },

    async truncate() {
      await repository.clear();
    },

    async select() {
      const rows = await repository.find({
        take: 1000,
        where: {
          value: 1,
        },
      });
      return rows;
    },

    async insert() {
      const item = await repository.insert({
        name: `Test`,
        value: 1,
      });
      return item.identifiers;
    },
  };
};
