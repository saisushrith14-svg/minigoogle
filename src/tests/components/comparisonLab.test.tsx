import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../state/AppContext';

function renderComparison() {
  return render(
    <MemoryRouter initialEntries={['/compare']}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('ranking comparison lab', () => {
  it('renders all four models and a position matrix', () => {
    renderComparison();
    expect(
      screen.getByRole('heading', { level: 1, name: /Ranking comparison lab/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Keyword \(1997\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /PageRank \(1998\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hybrid/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Behavioural/i })).toBeInTheDocument();
    expect(screen.getByText(/Position matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Largest rank movements/i)).toBeInTheDocument();
  });

  it('updates the effective blend from the hybrid slider', () => {
    renderComparison();
    const slider = screen.getByLabelText(/Keyword ↔ PageRank balance/i);
    fireEvent.change(slider, { target: { value: '0.9' } });
    expect(screen.getByText(/90% keyword \/ 10% PageRank/i)).toBeInTheDocument();
  });

  it('selects a page and exposes its cross-model explanations', async () => {
    const user = userEvent.setup();
    renderComparison();
    const insiderButtons = screen.getAllByRole('button', {
      name: /Global Travel Insider: Comprehensive Guide/i,
    });
    await user.click(insiderButtons[0]);
    expect(screen.getByText(/traveler-insider\.org/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected page/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Position \d+ from/i).length).toBeGreaterThan(0);
  });
});
