import { db } from './db';

const test = async () => {

const rows = await db.test
  .insert({
    id: null,
    createdAt: null,
    name: `My Test`,
    value: 123,
  })
  .returning('id');

rows.forEach(row => row.id);



























};

test();