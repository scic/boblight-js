const boblib = require('./index')

test('color red exists', () => {
  expect(boblib.Colors.red).toEqual(new boblib.Color(1, 0, 0))
})
