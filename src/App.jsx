import { useEffect, useMemo, useRef, useState } from 'react';
import { allCalculators, calculatorCategories } from './calculators';
import './styles.css';

const asNumber = (v) => Number(v || 0);
const SIDEBAR_COLLAPSED_KEY = 'onkologi.sidebar.collapsed';
const PINNED_KEY = 'onkologi.quick.pinned';
const RECENT_KEY = 'onkologi.quick.recent';
const MOBILE_BREAKPOINT = 960;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : parsed;
  } catch {
    return fallback;
  }
};

function App() {
  const sidebarRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [pinnedIds, setPinnedIds] = useState(() => readJson(PINNED_KEY, []));
  const [recentIds, setRecentIds] = useState(() => readJson(RECENT_KEY, []));
  const [values, setValues] = useState(() => {
    const initial = {};
    allCalculators.forEach((calc) => {
      initial[calc.id] = Object.fromEntries(calc.fields.map(([key, _label, defaultValue]) => [key, defaultValue]));
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
  }, [recentIds]);

  useEffect(() => {
    const onResize = () => {
      const mobileMode = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobileMode);
      if (!mobileMode) setIsMobileDrawerOpen(false);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isMobileDrawerOpen || !isMobile) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMobileDrawerOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !sidebarRef.current) return;
      const focusables = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    sidebarRef.current?.querySelector('button, input, select')?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen, isMobile]);

  const categoryCounts = useMemo(
    () => Object.fromEntries(calculatorCategories.map((cat) => [cat.id, cat.calculators.length])),
    []
  );

  const filteredCategories = useMemo(() => {
    return calculatorCategories
      .map((category) => ({
        ...category,
        calculators: category.calculators.filter((calc) => {
          const byCategory = selectedCategory === 'all' || category.id === selectedCategory;
          const bySearch = `${calc.name} ${category.title}`.toLowerCase().includes(query.toLowerCase());
          return byCategory && bySearch;
        })
      }))
      .filter((category) => category.calculators.length > 0);
  }, [query, selectedCategory]);

  const calculatorsById = useMemo(() => Object.fromEntries(allCalculators.map((calc) => [calc.id, calc])), []);

  const stats = {
    total: allCalculators.length,
    visible: filteredCategories.reduce((sum, cat) => sum + cat.calculators.length, 0),
    categories: calculatorCategories.length
  };

  const touchRecent = (calcId) => {
    setRecentIds((prev) => [calcId, ...prev.filter((id) => id !== calcId)].slice(0, 8));
  };

  const togglePin = (calcId) => {
    setPinnedIds((prev) => (prev.includes(calcId) ? prev.filter((id) => id !== calcId) : [calcId, ...prev].slice(0, 8)));
  };

  const focusCalculator = (calcId) => {
    const calc = calculatorsById[calcId];
    if (!calc) return;
    setSelectedCategory(calc.categoryId);
    setQuery('');
    touchRecent(calcId);
    if (isMobile) setIsMobileDrawerOpen(false);
    requestAnimationFrame(() => {
      const el = document.getElementById(`calc-${calcId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const quickPinned = pinnedIds.map((id) => calculatorsById[id]).filter(Boolean);
  const quickRecent = recentIds.filter((id) => !pinnedIds.includes(id)).map((id) => calculatorsById[id]).filter(Boolean);

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="hamburger"
        type="button"
        aria-label="Buka menu"
        aria-expanded={isMobileDrawerOpen}
        onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
      >
        ☰
      </button>

      {isMobile && isMobileDrawerOpen && <button className="drawer-overlay" aria-label="Tutup menu" onClick={() => setIsMobileDrawerOpen(false)} />}

      <aside
        ref={sidebarRef}
        className={`sidebar ${isMobileDrawerOpen ? 'drawer-open' : ''}`}
        aria-hidden={isMobile && !isMobileDrawerOpen}
      >
        <div className="sidebar-header">
          <div>
            <h1>Onkologi Radiasi</h1>
            {!isSidebarCollapsed && <p>Admin Panel Perhitungan Klinis</p>}
          </div>
          <button
            className="collapse-btn"
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <>
            <div className="stat-grid">
              <div><strong>{stats.total}</strong><span>Fitur</span></div>
              <div><strong>{stats.categories}</strong><span>Kategori</span></div>
              <div><strong>{stats.visible}</strong><span>Aktif</span></div>
            </div>

            <label htmlFor="search-input">Cari fitur</label>
            <input
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="BED, DVH, IMRT..."
            />

            <section className="sidebar-section">
              <h3>Kategori</h3>
              <div className="category-list" role="listbox" aria-label="Filter kategori">
                <button
                  type="button"
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <span>Semua Kategori</span>
                  <span className="badge">{stats.total}</span>
                </button>
                {calculatorCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.title}</span>
                    <span className="badge">{categoryCounts[category.id]}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="sidebar-section">
              <h3>Quick Access</h3>
              <p className="quick-caption">Pinned + Recent</p>

              <div className="quick-group">
                <strong>Pinned</strong>
                {quickPinned.length === 0 && <small>Belum ada kalkulator pinned.</small>}
                {quickPinned.map((calc) => (
                  <button key={`p-${calc.id}`} type="button" className="quick-item" onClick={() => focusCalculator(calc.id)}>
                    {calc.name}
                  </button>
                ))}
              </div>

              <div className="quick-group">
                <strong>Recent</strong>
                {quickRecent.length === 0 && <small>Belum ada aktivitas terbaru.</small>}
                {quickRecent.slice(0, 5).map((calc) => (
                  <button key={`r-${calc.id}`} type="button" className="quick-item" onClick={() => focusCalculator(calc.id)}>
                    {calc.name}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </aside>

      <main className="content">
        {filteredCategories.map((category) => (
          <section key={category.id}>
            <h2>{category.title}</h2>
            <div className="grid">
              {category.calculators.map((calc) => {
                const payload = Object.fromEntries(
                  Object.entries(values[calc.id]).map(([k, v]) => [k, asNumber(v)])
                );
                const result = calc.compute(payload);
                const output = calc.formatter ? calc.formatter(result) : Number.isFinite(result) ? result.toFixed(4) : '∞';
                const isPinned = pinnedIds.includes(calc.id);

                return (
                  <article
                    key={calc.id}
                    id={`calc-${calc.id}`}
                    className="card"
                    style={{ borderTop: `4px solid ${category.color}` }}
                    onMouseEnter={() => touchRecent(calc.id)}
                  >
                    <header>
                      <small>#{calc.id}</small>
                      <h3>{calc.name}</h3>
                      <button
                        type="button"
                        className={`pin-btn ${isPinned ? 'active' : ''}`}
                        onClick={() => togglePin(calc.id)}
                        aria-label={isPinned ? `Unpin ${calc.name}` : `Pin ${calc.name}`}
                      >
                        {isPinned ? '★ Pinned' : '☆ Pin'}
                      </button>
                    </header>
                    {calc.fields.map(([fieldKey, label]) => (
                      <label key={fieldKey}>
                        <span>{label}</span>
                        <input
                          type="number"
                          step="any"
                          value={values[calc.id][fieldKey]}
                          onFocus={() => touchRecent(calc.id)}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [calc.id]: { ...prev[calc.id], [fieldKey]: e.target.value }
                            }))
                          }
                        />
                      </label>
                    ))}
                    <div className="result">
                      <span>Hasil</span>
                      <strong>{output} {calc.unit !== 'status' ? calc.unit : ''}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;
