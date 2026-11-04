import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import { Button, Card } from '../components/ui/Primitives';

export function NotFoundPage() {
  return (
    <div className="page-section">
      <div className="page-shell flex min-h-[55vh] items-center justify-center">
        <Card className="max-w-xl p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Compass size={28} aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            404 · page not found
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            This page is not in the index.
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The route does not correspond to any section of the lab. Return to the search
            experience or start again from the home page.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/">
              <Button>
                <Home size={14} aria-hidden="true" /> Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="secondary">
                <Search size={14} aria-hidden="true" /> Search
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
