import { setup as setupMammoth } from './tests/pg-mammoth.js';
import { setup as setupKnex } from './tests/knex.js';
import { setup as setupTypeorm } from './tests/typeorm.js';

const test = async (name, fn) => {
  const times = [];

  for (const _ of Array.from({ length: 10_000 })) {
    const start = process.hrtime.bigint();
    const _rows = await fn();
    const end = process.hrtime.bigint();

    times.push({
      start,
      end,
    });
  }

  const result = times.reduce(
    (result, time) => {
      const total = time.end - time.start;
      if (!result) {
        return {
          min: total,
          max: total,
          sum: total,
        };
      }

      if (!result.min || total < result.min) {
        result.min = total;
      }

      if (total > result.max) {
        result.max = total;
      }

      result.sum = result.sum + total;
      return result;
    },
    { min: undefined, max: 0n, sum: 0n },
  );
  const nanoSecondsToMilliSeconds = 1000000;
  const avg =
    Math.round((Number(result.sum / BigInt(times.length)) / nanoSecondsToMilliSeconds) * 100) / 100;
  const min = Math.round((Number(result.min) / nanoSecondsToMilliSeconds) * 100) / 100;
  const max = Math.round((Number(result.max) / nanoSecondsToMilliSeconds) * 100) / 100;
  const total = Math.floor((Number(result.sum) / 1000000000) * 100) / 100;

  console.log(`${name}; min = ${min}ms; max = ${max}ms; avg = ${avg}ms; total = ${total}s`);
};

const targets = [() => setupMammoth(), () => setupKnex(), () => setupTypeorm()];

for (const target of targets) {
  const setup = await target();

  await setup.truncate();

  await test(`${setup.name}#insert`, setup.insert);
  await test(`${setup.name}#select`, setup.select);

  await setup.cleanUp();
}
