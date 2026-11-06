import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './state/AppContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { GraphPage } from './pages/GraphPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { LearnPage } from './pages/LearnPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { GuidedTourPage } from './pages/GuidedTourPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Route table without a router, so tests can mount it in a MemoryRouter. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tour" element={<GuidedTourPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="compare" element={<ComparisonPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
