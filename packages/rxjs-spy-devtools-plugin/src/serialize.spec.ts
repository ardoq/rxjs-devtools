import serialize from './serialize';

test('serializes null', () => {
  expect(serialize(null)).toBe('null');
});

test('serializes maps', () => {
  expect(serialize(new Map([['a', 1], ['b', 2]]))).toBe('[[\"a\",1],[\"b\",2]]');
});