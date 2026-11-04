import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../state/AppContext';

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/search']}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('search experience', () => {
  it('switches dataset, query, and ranking model through real interactions', async () => {
    const user = userEvent.setup();
    renderSearch();

    const queryInput = screen.getByLabelText('Search query');
    expect(queryInput).toHaveValue('cheap flights');

    await user.selectOptions(screen.getByLabelText('Selected dataset'), 'authority-problem');
    expect(queryInput).toHaveValue('cancer research');

    await user.clear(queryInput);
    await user.type(queryInput, 'targeted therapy');
    expect(queryInput).toHaveValue('targeted therapy');

    const pageRankTab = screen.getByRole('tab', { name: /PageRank \(1998\)/i });
    await user.click(pageRankTab);
    expect(pageRankTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText(/ranked pages/i)).toBeInTheDocument();
    expect(screen.getByText(/PageRank converged/i)).toBeInTheDocument();
  });

  it('expands a result to reveal the factor breakdown computed by the pipeline', async () => {
    const user = userEvent.setup();
    renderSearch();

    const whyButtons = screen.getAllByRole('button', { name: /Why this rank\?/i });
    await user.click(whyButtons[0]);
    expect(screen.getByText(/Position 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Length normalization/i)).toBeInTheDocument();
    expect(screen.getByText(/multiplier/i)).toBeInTheDocument();
  });
});
