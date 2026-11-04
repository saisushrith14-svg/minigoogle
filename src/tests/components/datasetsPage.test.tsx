import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../state/AppContext';

function renderDatasets() {
  return render(
    <MemoryRouter initialEntries={['/datasets']}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('dataset browser', () => {
  it('switches the active corpus and shows its pages and educational notes', async () => {
    const user = userEvent.setup();
    renderDatasets();

    expect(
      screen.getByRole('heading', { level: 1, name: /Curated search corpora/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Cheap Flights Spammer/i).length).toBeGreaterThan(0);

    const useButton = screen.getByRole('button', {
      name: /Use dataset: The New Website Cold Start/i,
    });
    await user.click(useButton);

    expect(screen.getByText(/flour-and-water\.example/i)).toBeInTheDocument();
    expect(screen.getByText(/What to watch for/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sourdough starter guide/i).length).toBeGreaterThan(0);
  });
});
