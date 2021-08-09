import knexImport from 'knex';

export const setup = () => {
  const knex = knexImport({
    client: 'pg',
    connection: process.env.PG,
  });

  return {
    name: `knex.js`,

    async cleanUp() {
      await knex.destroy();
    },

    async truncate() {
      await knex(`item`).truncate();
    },

    async select() {
      const rows = await knex
        .select(`id`, `name`, `value`)
        .from(`item`)
        .where({ value: 1 })
        .limit(1000);
      return rows;
    },

    async insert() {
      const rows = await knex(`item`)
        .insert({
          name: `Test`,
          value: 1,
        })
        .returning(`id`);
      return rows;
    },
  };
};
