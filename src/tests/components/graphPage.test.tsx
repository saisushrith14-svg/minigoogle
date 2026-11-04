import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../state/AppContext';

function renderGraph() {
  return render(
    <MemoryRouter initialEntries={['/graph?page=ks-spam']}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('interactive graph page', () => {
  it('opens a deep-linked page in the inspector and switches metrics', async () => {
    const user = userEvent.setup();
    renderGraph();

    expect(
      screen.getByRole('heading', { level: 1, name: /Interactive hyperlink graph/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Page inspector/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Cheap Flights! Cheap Flights - Cheap Flight Deals/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Rank in each model/i)).toBeInTheDocument();

    const pageRankMetric = screen.getByRole('button', { name: /PageRank/i });
    await user.click(pageRankMetric);
    expect(pageRankMetric).toHaveAttribute('aria-pressed', 'true');

    const circular = screen.getByRole('button', { name: /circular/i });
    await user.click(circular);
    expect(circular).toHaveAttribute('aria-pressed', 'true');
  });
});
