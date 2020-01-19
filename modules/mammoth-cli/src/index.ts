/**
 * --config .mammothrc.ts
 *
 * mammoth init/bootstrap
 * Generates a migrations dir, creates a config file
 *
 * mammoth new
 * Creates a new migration file
 *
 * mammoth migrate (== mammoth up --all)
 * Apply the migrations
 *
 * mammoth up
 * Apply 1 migration
 *
 * mammoth down
 * Rolls back the latest migration
 *
 * mammoth redo
 * Run, rollback and run the latest migration
 *
 * mammoth generate [schema] or build
 *
 */
import minimist from 'minimist';

interface Arguments {}

const argv = minimist<Partial<Arguments>>(process.argv.slice(2));
const [action, specifier] = argv._;
