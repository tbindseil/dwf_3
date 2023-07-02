import React from 'react';
import { render, screen } from '@testing-library/react';
import { HomeScreen } from '../../src/components/home_screen';

test('renders learn react link', () => {
  console.log('@@ TJTAG @@ 1');
  render(<HomeScreen />);
  console.log('@@ TJTAG @@ 2');
  const linkElement = screen.getByText(/learn react/i);
  console.log('@@ TJTAG @@ 3');
  expect(linkElement).toBeInTheDocument();
  console.log('@@ TJTAG @@ 4');
});
