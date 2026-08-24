import { render, screen } from '@testing-library/react';
import { Dialog } from '../dialog';

describe('Dialog', () => {
  it('renders children', () => {
    render(
      <Dialog open>
        <div>Dialog content</div>
      </Dialog>
    );
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });
});
