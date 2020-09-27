// This is used so we can capture the Returning of every different query type without having to
// specify every query seperately. The private property is used to simulate a nominal type so only
// this class is captured when doing a conditional type check (through T extends Query<infer Returning>).
export abstract class Query<Returning> {
  private _queryBrand!: Returning;
}