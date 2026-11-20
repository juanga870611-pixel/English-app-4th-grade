import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractWordFromCoords,
  generateWordSearchBoard,
  getLineCoords,
  matchWordSelection,
} from './wordSearchGenerator';

test('generateWordSearchBoard places all target words inside grid', () => {
  const targets = ['HEAD', 'TEETH', 'HANDS', 'SOAP', 'WATER', 'BRUSH'];
  const board = generateWordSearchBoard(targets, 8, 101);

  assert.equal(board.size, 8);
  assert.equal(board.grid.length, 8);
  assert.equal(board.placedWords.length, targets.length);

  for (const placed of board.placedWords) {
    const extracted = extractWordFromCoords(board.grid, placed.coords);
    assert.equal(extracted, placed.word);
  }
});

test('getLineCoords generates horizontal, vertical, and diagonal lines and rejects jagged lines', () => {
  assert.deepEqual(getLineCoords({ row: 0, col: 0 }, { row: 0, col: 3 }), [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
  ]);

  assert.deepEqual(getLineCoords({ row: 1, col: 1 }, { row: 3, col: 3 }), [
    { row: 1, col: 1 },
    { row: 2, col: 2 },
    { row: 3, col: 3 },
  ]);

  assert.deepEqual(getLineCoords({ row: 0, col: 0 }, { row: 1, col: 2 }), []);
});

test('matchWordSelection matches forward and backward selections without duplicates', () => {
  const targets = ['SOAP', 'HEAD'];
  const board = generateWordSearchBoard(targets, 8, 7);
  const soapPlaced = board.placedWords.find((p) => p.word === 'SOAP');
  assert.ok(soapPlaced);

  const found = new Set<string>();
  const reversed = [...soapPlaced.coords].reverse();

  const match1 = matchWordSelection(board.grid, reversed, targets, found);
  assert.equal(match1, 'SOAP');

  found.add('SOAP');
  const match2 = matchWordSelection(board.grid, soapPlaced.coords, targets, found);
  assert.equal(match2, null);
});
