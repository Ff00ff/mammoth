const iterable = new Array(75).fill(0);

console.log(`export interface SelectFn {
  ${iterable
    .map((_, index) => {
      const array = new Array(index + 1).fill(0);

      return `  <${array
        .map((_, index) => `C${index + 1} extends Selectable`)
        .join(`, `)}>(${array
        .map((_, index) => `c${index + 1}: C${index + 1}`)
        .join(`, `)}): SelectQuery<
        ${array
          .map((_, index) => `GetSelectable<C${index + 1}>`)
          .join(` & `)}, ContainsStar<${array.map((_, index) => `C${index + 1}`).join(` | `)}>
      >`;
    })
    .join(`;\n`)}
};`);
