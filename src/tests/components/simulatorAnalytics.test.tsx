import { render, screen } from '@testing-library/react';
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

describe('simulator to analytics integration', () => {
  it('records a deterministic run, replays events, and shares telemetry across routes', async () => {
    const user = userEvent.setup();
    renderRoute('/simulator');

    expect(screen.getByText(/No telemetry yet/i)).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /Run deterministic simulation/i }),
    );

    expect(
      await screen.findByText(/Replay the recorded event log/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/This run matches the current dataset/i)).toBeInTheDocument();
    expect(screen.getByText(/Event 1 of \d+/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Next event/i }));
    expect(screen.getByText(/Event 2 of \d+/i)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Analytics' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /Behaviour analytics/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Click-through rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Behaviour score derivation/i)).toBeInTheDocument();
    expect(screen.getByText(/This run is current/i)).toBeInTheDocument();
  });
});
