/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import {it, expect, jest} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';

it('renders correctly', async () => {
  jest.useFakeTimers();
  let root: any;
  await act(async () => {
    root = renderer.create(<App />);
  });
  await act(async () => {
    jest.runAllTimers();
  });
  expect(root).toBeDefined();
  jest.useRealTimers();
});
