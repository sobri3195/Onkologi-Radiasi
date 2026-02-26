import { useEffect, useMemo, useState } from 'react';
import { allCalculators, calculatorCategories } from './calculators';
import './styles.css';

const asNumber = (v) => Number(v || 0);
const RECENT_LIMIT = 4;

function App() {
  const sidebarRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quick_pinned_calculators') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quick_recent_calculators') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const [values, setValues] = useState(() => {
    const initial = {};
    allCalculators.forEach((calc) => {
      initial[calc.id] = Object.fromEntries(calc.fields.map(([key, _label, defaultValue]) => [key, defaultValue]));
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('quick_pinned_calculators', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem('quick_recent_calculators', JSON.stringify(recentIds));
  }, [recentIds]);

  const categoryCountMap = useMemo(() => {
    const counts = { all: allCalculators.length };
    calculatorCategories.forEach((category) => {
      counts[category.id] = category.calculators.length;
    });
    return counts;
  }, []);

  const filteredCategories = useMemo(() => {
    const search = query.toLowerCase().trim();
    return calculatorCategories
      .map((category) => ({
        ...category,
        calculators: category.calculators.filter((calc) => {
          const byCategory = selectedCategory === 'all' || category.id === selectedCategory;
          const bySearch = `${calc.name} ${category.title}`.toLowerCase().includes(search);
          return byCategory && bySearch;
        })
      }))
      .filter((category) => category.calculators.length > 0);
  }, [query, selectedCategory]);


  const stats = {
    total: allCalculators.length,
    visible: filteredCategories.reduce((sum, cat) => sum + cat.calculators.length, 0),
    categories: calculatorCategories.length
  };

  const selectedCategoryTitle = selectedCategory === 'all'
    ? 'Semua Kategori'
    : calculatorCategories.find((category) => category.id === selectedCategory)?.title || 'Kategori';

  const activeFiltersCount = Number(query.trim().length > 0) + Number(selectedCategory !== 'all');

  const calculatorsById = useMemo(
    () => Object.fromEntries(allCalculators.map((calc) => [calc.id, calc])),
    []
  );

  const quickAccessItems = useMemo(() => {
    const pinnedItems = pinnedIds.map((id) => calculatorsById[id]).filter(Boolean);
    const recentItems = recentIds
      .filter((id) => !pinnedIds.includes(id))
      .map((id) => calculatorsById[id])
      .filter(Boolean);
    return [...pinnedItems, ...recentItems].slice(0, RECENT_LIMIT + 2);
  }, [calculatorsById, pinnedIds, recentIds]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsMobileSidebarOpen(false);
  };

  const registerRecent = (calculatorId) => {
    setRecentIds((prev) => [calculatorId, ...prev.filter((id) => id !== calculatorId)].slice(0, RECENT_LIMIT));
  };

  const togglePin = (calculatorId) => {
    setPinnedIds((prev) => (
      prev.includes(calculatorId)
        ? prev.filter((id) => id !== calculatorId)
        : [calculatorId, ...prev]
    ));
  };

  return (
    <div className={`app-shell ${isMobileSidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        className="mobile-menu-btn"
        type="button"
        onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
      >
        ☰ Menu
      </button>
      <div className="sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} aria-hidden="true" />

      <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className="sidebar">
          <div className="sidebar-block brand-block">
            <div>
              <h1>{isSidebarCollapsed ? 'OR' : 'Onkologi Radiasi'}</h1>
              {!isSidebarCollapsed && <p>Admin Panel Perhitungan Klinis</p>}
            </div>
            <button
              type="button"
              className="collapse-btn"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? '→' : '←'}
            </button>
            <div className="stat-grid">
              <div><strong>{stats.total}</strong><span>Fitur</span></div>
              <div><strong>{stats.categories}</strong><span>Kategori</span></div>
              <div><strong>{stats.visible}</strong><span>Aktif</span></div>
            </div>
          </div>

          <div className="sidebar-block filter-block">
            <div className="input-group">
              <label htmlFor="search-calc">Cari fitur</label>
              <input
                id="search-calc"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BED, DVH, IMRT..."
              />
            </div>
            <div className="input-group">
              <label htmlFor="category-select">Kategori aktif</label>
              <select id="category-select" value={selectedCategory} onChange={(e) => handleCategorySelect(e.target.value)}>
                <option value="all">Semua Kategori ({categoryCountMap.all})</option>
                {calculatorCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.title} ({categoryCountMap[category.id]})</option>
                ))}
              </select>
            </div>
            <div className="filter-indicator">Filter aktif: {activeFiltersCount}</div>
          </div>

          <div className="sidebar-block nav-block">
            <h4>Quick Access</h4>
            <ul className="quick-list">
              {quickAccessItems.length === 0 && <li className="empty-state">Belum ada pinned/recent.</li>}
              {quickAccessItems.map((calc) => (
                <li key={`quick-${calc.id}`}>
                  <button type="button" onClick={() => handleCategorySelect(calc.categoryId)}>
                    <span>{calc.name}</span>
                    <small>{calc.categoryTitle}</small>
                  </button>
                </li>
              ))}
            </ul>

            <h4>Kategori</h4>
            <ul className="category-list">
              <li>
                <button
                  type="button"
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => handleCategorySelect('all')}
                >
                  <span>Semua Kategori</span>
                  <strong>{categoryCountMap.all}</strong>
                </button>
              </li>
              {calculatorCategories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={selectedCategory === category.id ? 'active' : ''}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <span>{category.title}</span>
                    <strong>{categoryCountMap[category.id]}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="content">
          <div className="context-bar">
            <span>Home / Kalkulator / {selectedCategoryTitle}</span>
            <strong>{activeFiltersCount > 0 ? `${activeFiltersCount} filter berjalan` : 'Tanpa filter aktif'}</strong>
          </div>
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
                      className="card"
                      style={{ borderTop: `4px solid ${category.color}` }}
                      onMouseEnter={() => registerRecent(calc.id)}
                    >
                      <header>
                        <small>#{calc.id}</small>
                        <div className="card-title-row">
                          <h3>{calc.name}</h3>
                          <button type="button" className="pin-btn" onClick={() => togglePin(calc.id)}>
                            {isPinned ? '★' : '☆'}
                          </button>
                        </div>
                      </header>
                      {calc.fields.map(([fieldKey, label]) => (
                        <label key={fieldKey}>
                          <span>{label}</span>
                          <input
                            type="number"
                            step="any"
                            value={values[calc.id][fieldKey]}
                            onFocus={() => registerRecent(calc.id)}
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
    </div>
  );
}

export default App;
