// Based on https://johnresig.com/projects/javascript-diff-algorithm/ by John Resig (License MIT)

import type { Change } from '../Change/Change.ts'
import * as DiffType from '../DiffType/DiffType.ts'
import * as MakeDiffMap from '../MakeDiffMap/MakeDiffMap.ts'

export type AlignmentEntry =
  | number
  | {
      nc: number
      oc: number
      olno: number
    }

export const getAlignmentMaps = (
  linesA: readonly string[],
  linesB: readonly string[],
): {
  oa: AlignmentEntry[]
  na: AlignmentEntry[]
} => {
  // create hashmaps of which line corresponds to which indices
  const { oa, na } = MakeDiffMap.makeDiffMap(linesA, linesB) as {
    oa: AlignmentEntry[]
    na: AlignmentEntry[]
  }

  // pass 3
  for (let i = 0; i < na.length; i++) {
    const entry = na[i]
    if (typeof entry !== 'number' && entry.nc === 1 && entry.oc === 1) {
      na[i] = entry.olno
      oa[entry.olno] = i
    }
  }

  // pass 4
  for (let i = 0; i < na.length - 1; i++) {
    const j = na[i]
    if (typeof j === 'number' && na[i + 1] === oa[j + 1]) {
      oa[j + 1] = i + 1
      na[i + 1] = j + 1
    }
  }

  // pass 5
  for (let i = na.length; i > 0; i--) {
    const j = na[i]
    if (typeof j === 'number' && na[i - 1] === oa[j - 1]) {
      na[i - 1] = j - 1
      oa[j - 1] = i - 1
    }
  }

  return { oa, na }
}

export const diff = (
  linesA: readonly string[],
  linesB: readonly string[],
): {
  changesLeft: readonly Change[]
  changesRight: readonly Change[]
} => {
  const { oa, na } = getAlignmentMaps(linesA, linesB)

  const changesRight: Change[] = []
  const changesLeft: Change[] = []

  for (let i = 0; i < na.length; i++) {
    const j = na[i]
    if (typeof j === 'number') {
      // stayed the same
    } else {
      changesRight.push({ type: DiffType.Insertion, index: i })
    }
  }

  for (let i = 0; i < oa.length; i++) {
    const j = oa[i]
    if (typeof j === 'number') {
      // stayed the same
    } else {
      changesLeft.push({ type: DiffType.Deletion, index: i })
    }
  }

  return { changesLeft, changesRight }
}
