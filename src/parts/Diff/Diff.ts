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

const createUnmatchedEntry = (): Exclude<AlignmentEntry, number> => {
  return {
    nc: 0,
    oc: 0,
    olno: -1,
  }
}

const isMatched = (entry: AlignmentEntry | undefined): entry is number => {
  return typeof entry === 'number'
}

const setMatch = (oa: AlignmentEntry[], na: AlignmentEntry[], leftIndex: number, rightIndex: number): void => {
  oa[leftIndex] = rightIndex
  na[rightIndex] = leftIndex
}

const alignCommonPrefix = (
  oa: AlignmentEntry[],
  na: AlignmentEntry[],
  linesA: readonly string[],
  linesB: readonly string[],
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
): {
  leftStart: number
  rightStart: number
} => {
  while (leftStart < leftEnd && rightStart < rightEnd && linesA[leftStart] === linesB[rightStart]) {
    setMatch(oa, na, leftStart, rightStart)
    leftStart++
    rightStart++
  }
  return {
    leftStart,
    rightStart,
  }
}

const alignCommonSuffix = (
  oa: AlignmentEntry[],
  na: AlignmentEntry[],
  linesA: readonly string[],
  linesB: readonly string[],
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
): {
  leftEnd: number
  rightEnd: number
} => {
  while (leftStart < leftEnd && rightStart < rightEnd && linesA[leftEnd - 1] === linesB[rightEnd - 1]) {
    setMatch(oa, na, leftEnd - 1, rightEnd - 1)
    leftEnd--
    rightEnd--
  }
  return {
    leftEnd,
    rightEnd,
  }
}

const getLocalMatches = (na: AlignmentEntry[], oa: AlignmentEntry[]): Array<{ leftIndex: number; rightIndex: number }> => {
  for (let i = 0; i < na.length; i++) {
    const entry = na[i]
    if (!isMatched(entry) && entry.nc === 1 && entry.oc === 1) {
      na[i] = entry.olno
      oa[entry.olno] = i
    }
  }

  for (let i = 0; i < na.length - 1; i++) {
    const leftIndex = na[i]
    if (isMatched(leftIndex) && na[i + 1] === oa[leftIndex + 1]) {
      oa[leftIndex + 1] = i + 1
      na[i + 1] = leftIndex + 1
    }
  }

  for (let i = na.length - 1; i > 0; i--) {
    const leftIndex = na[i]
    if (isMatched(leftIndex) && na[i - 1] === oa[leftIndex - 1]) {
      na[i - 1] = leftIndex - 1
      oa[leftIndex - 1] = i - 1
    }
  }

  const matches: Array<{ leftIndex: number; rightIndex: number }> = []
  for (let rightIndex = 0; rightIndex < na.length; rightIndex++) {
    const leftIndex = na[rightIndex]
    if (isMatched(leftIndex)) {
      matches.push({
        leftIndex,
        rightIndex,
      })
    }
  }
  return matches
}

const alignRange = (
  oa: AlignmentEntry[],
  na: AlignmentEntry[],
  linesA: readonly string[],
  linesB: readonly string[],
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
): void => {
  if (leftStart >= leftEnd || rightStart >= rightEnd) {
    return
  }

  const prefix = alignCommonPrefix(oa, na, linesA, linesB, leftStart, leftEnd, rightStart, rightEnd)
  leftStart = prefix.leftStart
  rightStart = prefix.rightStart

  if (leftStart >= leftEnd || rightStart >= rightEnd) {
    return
  }

  const suffix = alignCommonSuffix(oa, na, linesA, linesB, leftStart, leftEnd, rightStart, rightEnd)
  leftEnd = suffix.leftEnd
  rightEnd = suffix.rightEnd

  if (leftStart >= leftEnd || rightStart >= rightEnd) {
    return
  }

  const { oa: localOa, na: localNa } = MakeDiffMap.makeDiffMap(linesA.slice(leftStart, leftEnd), linesB.slice(rightStart, rightEnd)) as {
    oa: AlignmentEntry[]
    na: AlignmentEntry[]
  }
  const matches = getLocalMatches(localNa, localOa)

  if (matches.length === 0) {
    return
  }

  for (const match of matches) {
    setMatch(oa, na, leftStart + match.leftIndex, rightStart + match.rightIndex)
  }

  let currentLeftStart = leftStart
  let currentRightStart = rightStart
  for (const match of matches) {
    const matchedLeftIndex = leftStart + match.leftIndex
    const matchedRightIndex = rightStart + match.rightIndex
    alignRange(oa, na, linesA, linesB, currentLeftStart, matchedLeftIndex, currentRightStart, matchedRightIndex)
    currentLeftStart = matchedLeftIndex + 1
    currentRightStart = matchedRightIndex + 1
  }
  alignRange(oa, na, linesA, linesB, currentLeftStart, leftEnd, currentRightStart, rightEnd)
}

export const getAlignmentMaps = (
  linesA: readonly string[],
  linesB: readonly string[],
): {
  oa: AlignmentEntry[]
  na: AlignmentEntry[]
} => {
  const oa = Array.from({ length: linesA.length }, createUnmatchedEntry)
  const na = Array.from({ length: linesB.length }, createUnmatchedEntry)
  alignRange(oa, na, linesA, linesB, 0, linesA.length, 0, linesB.length)

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
