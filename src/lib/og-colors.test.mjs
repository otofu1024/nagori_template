import test from 'node:test';
import assert from 'node:assert/strict';
import { readOgColors } from './og-colors.mjs';

const ok = ':root { --og-bg: #FFFFFF; --og-text: #1e2a3f; --og-accent: #cfeff6; }';

test('正常な値を読む', () => {
  assert.deepEqual(readOgColors(ok), { bg: '#FFFFFF', text: '#1e2a3f', accent: '#cfeff6' });
});

test('変数が足りないとエラー', () => {
  assert.throws(() => readOgColors(':root { --og-bg: #ffffff; --og-text: #000000; }'), /--og-accent がありません/);
});

test('変数が重複するとエラー', () => {
  assert.throws(() => readOgColors(ok.replace('}', '--og-bg: #000000; }')), /--og-bg が 2 回/);
});

test('形式が違うとエラー', () => {
  assert.throws(() => readOgColors(ok.replace('#1e2a3f', 'red')), /--og-text の値 "red"/);
  assert.throws(() => readOgColors(ok.replace('#FFFFFF', '#fff')), /--og-bg の値 "#fff"/);
});
