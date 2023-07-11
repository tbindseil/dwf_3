import { render, screen } from '@testing-library/react';
import { ErrorText } from './error_text';

describe('ErrorText tests', () => {
  const message = 'message';
  it('shows the message when in error', () => {
    render(<ErrorText inError={false} message={message} />);
    expect(() => screen.getByText(message)).toThrow();
  });

  it('does not show the message when not in error', () => {
    render(<ErrorText inError={true} message={message} />);
    const errorText = screen.getByText(message);
    expect(errorText).toBeInTheDocument();
  });
});
