import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { AppProvider } from '../../state/AppContext';

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('application shell and navigation', () => {
  it('renders the home page with live ranking sections', () => {
    renderRoute('/');
    expect(
      screen.getByRole('heading', { level: 1, name: /See how search learned to rank the web/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Same query, four worldviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Six curated scenarios/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Keyword \(1997\)/i).length).toBeGreaterThan(0);
  });

  it('navigates through primary routes without losing the app shell', async () => {
    const user = userEvent.setup();
    renderRoute('/');
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });

    await user.click(within(primaryNav).getByRole('link', { name: 'Learn' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /How the ranking actually works/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Current corpus:/i)).toBeInTheDocument();

    await user.click(within(primaryNav).getByRole('link', { name: 'Compare' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /Ranking comparison lab/i }),
    ).toBeInTheDocument();

    await user.click(within(primaryNav).getByRole('link', { name: 'Datasets' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /Curated search corpora/i }),
    ).toBeInTheDocument();

    await user.click(within(primaryNav).getByRole('link', { name: 'Search' }));
    expect(await screen.findByRole('heading', { name: /ranked pages/i })).toBeInTheDocument();
  });

  it('shows a meaningful not-found page for unknown routes', () => {
    renderRoute('/this-route-does-not-exist');
    expect(
      screen.getByRole('heading', { level: 1, name: /This page is not in the index/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
