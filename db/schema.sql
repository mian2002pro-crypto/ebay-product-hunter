CREATE TABLE IF NOT EXISTS trend_snapshots (
  id BIGSERIAL PRIMARY KEY,
  market VARCHAR(8) NOT NULL,
  search_query TEXT NOT NULL DEFAULT '',
  term TEXT NOT NULL,
  listings INTEGER NOT NULL DEFAULT 0,
  avg_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  season VARCHAR(32) NOT NULL DEFAULT 'Evergreen',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trend_snapshots_lookup_idx
  ON trend_snapshots (market, search_query, captured_at DESC);

CREATE INDEX IF NOT EXISTS trend_snapshots_term_idx
  ON trend_snapshots (market, search_query, term, captured_at DESC);
