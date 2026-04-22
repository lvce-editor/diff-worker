import { expect, test } from '@jest/globals'
import * as Diff from '../src/parts/Diff/Diff.ts'
import * as DiffType from '../src/parts/DiffType/DiffType.ts'

test('deletion', () => {
  const linesA = ['a']
  const linesB = []
  expect(Diff.diff(linesA, linesB)).toEqual({
    changesLeft: [
      {
        index: 0,
        type: DiffType.Deletion,
      },
    ],
    changesRight: [],
  })
})

test('insertion', () => {
  const linesA = []
  const linesB = ['a']
  expect(Diff.diff(linesA, linesB)).toEqual({
    changesLeft: [],
    changesRight: [
      {
        index: 0,
        type: DiffType.Insertion,
      },
    ],
  })
})

test('two insertions', () => {
  const linesA = []
  const linesB = ['a', 'b']
  expect(Diff.diff(linesA, linesB)).toEqual({
    changesLeft: [],
    changesRight: [
      {
        index: 0,
        type: DiffType.Insertion,
      },
      {
        index: 1,
        type: DiffType.Insertion,
      },
    ],
  })
})

test('three insertions', () => {
  const linesA = []
  const linesB = ['a', 'b', 'c']
  expect(Diff.diff(linesA, linesB)).toEqual({
    changesLeft: [],
    changesRight: [
      {
        index: 0,
        type: DiffType.Insertion,
      },
      {
        index: 1,
        type: DiffType.Insertion,
      },
      {
        index: 2,
        type: DiffType.Insertion,
      },
    ],
  })
})

test('insertion at start', () => {
  const linesA = ['b', 'c']
  const linesB = ['a', 'b', 'c']
  expect(Diff.diff(linesA, linesB)).toEqual({
    changesLeft: [],
    changesRight: [
      {
        index: 0,
        type: 1,
      },
    ],
  })
})

test('identical repeated lines stay aligned', () => {
  const linesA = ['}', '}']
  const linesB = ['}', '}']
  expect(Diff.getAlignmentMaps(linesA, linesB)).toEqual({
    oa: [0, 1],
    na: [0, 1],
  })
})

test('aligns repeated braces and blank lines inside a changed css block', () => {
  const linesA = `.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #202020;
}

.form input::placeholder {
  color: #888;
}

.form button:hover {
  background: #2b2b2b;
}
`
    .trimEnd()
    .split('\n')
  const linesB = `.form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  color: #111;
}

.form input::placeholder {
  color: #555;
  opacity: 1;
}

.form button:hover,
.form button:focus-visible {
  background: #111;
  outline: 2px solid #fff;
}
`
    .trimEnd()
    .split('\n')

  const { oa, na } = Diff.getAlignmentMaps(linesA, linesB)

  expect(oa[9]).toBe(10)
  expect(oa[10]).toBe(11)
  expect(oa[13]).toBe(16)
  expect(na[10]).toBe(9)
  expect(na[11]).toBe(10)
  expect(na[16]).toBe(13)
})

test.skip('insertion at end', () => {
  const linesA = ['a', 'b']
  const linesB = ['a', 'b', 'c']
  const expected = [0, 0, 1, 1]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})

test.skip('insertion at start and end', () => {
  const linesA = ['c']
  const linesB = ['a', 'b', 'c', 'd']
  const expected = [0, 0, 1, 2, 1, 0, 4, 4]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})

test.skip('replacement', () => {
  const linesA = ['a']
  const linesB = ['b']
  const expected = [1, 1, 1, 1]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})

test.skip('word replacement', () => {
  const linesA = ['The', 'cat', 'in', 'the', 'hat']
  const linesB = ['The', 'dog', 'in', 'the', 'hat']
  const expected = [2, 2, 2, 2]
  expect(Diff.diff(linesA, linesB)).toEqual([new Uint32Array(expected)])
})

test.skip('word insertion', () => {
  const linesA = ['The', 'cat', 'in', 'the', 'hat']
  const linesB = ['The', 'furry', 'cat', 'in', 'the', 'hat']
  const expected = [1, 0, 2, 2]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})

test.skip('wordDeletion', () => {
  const linesA = ['The', 'cat', 'in', 'the', 'hat']
  const linesB = ['The', 'cat']
  const expected = [3, 5, 2, 0]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})

test.skip('two edits', () => {
  const linesA = ['The', 'cat', 'in', 'the', 'hat']
  const linesB = ['The', 'ox', 'in', 'the', 'box']
  const expected = [1, 1, 1, 1, 5, 5, 5, 5]
  expect(Diff.diff(linesA, linesB)).toEqual(new Uint32Array(expected))
})
