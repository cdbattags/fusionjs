/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import App, {consumeSanitizedHTML} from 'fusion-core';

import {getSimulator} from 'fusion-test-utils';

import {getFontConfig} from './fixtures/static/font-config';

import FontLoaderReactPlugin from '../src/index';
import {FontLoaderReactToken, FontLoaderReactConfigToken} from '../src/tokens';

import {
  atomicFontFaces as expectedAtomicFontFaces,
  styledFontFaces as expectedStyledFontFaces,
  preloadLinks as expectedPreloadLinks,
} from './fixtures/expected';

test('exported as expected', () => {
  expect(FontLoaderReactPlugin).toBeTruthy();
  expect(typeof FontLoaderReactPlugin).toBe('object');
});

const atomicConfig = getFontConfig(false, {'Lato-Regular': true});
testFontLoader(atomicConfig, testAtomicFontLoad, 'atomic');
const styledConfig = getFontConfig(true);
testFontLoader(styledConfig, testStyledFontLoad, 'styled');

function testFontLoader(config, styleHeaderTest, type) {
  test(`plugin - middleware adds ${type} font faces`, () => {
    const app = new App('content', el => el);
    app.middleware(async (ctx, next) => {
      await next();
      styleHeaderTest(
        ctx.template.head.map(e => consumeSanitizedHTML(e)).join('')
      );
    });
    app.register(FontLoaderReactToken, FontLoaderReactPlugin);
    app.register(FontLoaderReactConfigToken, config);
    app.middleware((ctx, next) => {
      ctx.body = {
        head: [],
      };
      return next();
    });
    getSimulator(app).render('/');
  });
}

function testAtomicFontLoad(headerElement) {
  equalWithoutSpaces(
    headerElement,
    `<style>${expectedAtomicFontFaces}</style>${expectedPreloadLinks}`,
    'atomic font face generated by plugin'
  );
}

function testStyledFontLoad(headerElement) {
  equalWithoutSpaces(
    headerElement,
    `<style>${expectedStyledFontFaces}</style>`,
    'styled font face generated by plugin'
  );
}

function equalWithoutSpaces(str1, str2, description) {
  expect(str1.replace(/\s/g, '')).toBe(str2.replace(/\s/g, ''));
}