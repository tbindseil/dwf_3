import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('initially renders on home page', () => {
  const { container } = render(<App />);
  const value = container.getElementsByClassName('Home');
  expect(value.length).toEqual(1);
});
// mappings of route to screen are configuration, not going to test
