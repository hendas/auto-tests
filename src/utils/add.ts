export const add = (a: number, b: number) => {
  if (isNaN(a) || isNaN(b)) {
    throw new Error('incorrect number');
  }
  return a + b;
};
