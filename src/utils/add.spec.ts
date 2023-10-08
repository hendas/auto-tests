import { add } from './add';

// Przykład testu jednostkowego

describe('add function', () => {
  it('properly added', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('throw error when 1st argument is NaN', () => {
    let result;
    try {
      result = add(parseInt('incorrect'), 5);
    } catch (e) {
      result = e.message;
    }
    expect(result).toBe('incorrect number');
  });
});
