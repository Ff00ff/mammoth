const iterable = new Array(10).fill(0);

console.log(`export interface WithFn {
  ${iterable
    .map((_, index) => {
      const array = new Array(index + 1).fill(0);

      return `  <
        ${array
          .map((_, index) => {
            if (index === 0) {
              return `N1 extends string, W1 extends QueryFn<never>`;
            }

            return `N${index + 1} extends string, W${index + 1} extends QueryFn<${new Array(index)
              .fill(0)
              .map((_, index) => `{ [K in N${index + 1}]: FromItem<W${index + 1}> }`)
              .join(' & ')}>`;
          })
          .join(',')},
        Q extends Query<any>
      >(
        ${array
          .map((_, index) => `name${index + 1}: N${index + 1}, with${index + 1}: W${index + 1}`)
          .join(', ')},
        callback: (args: ${array
          .map((_, index) => `{ [K in N${index + 1}]: FromItem<W${index + 1}> }`)
          .join(' & ')}) => Q,
      ): Q`;
    })
    .join(`;\n`)}
};`);
