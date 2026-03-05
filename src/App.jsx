import { useMemo, useState } from 'react';
import { calculatorCategories } from './calculators';
import './styles.css';

const asNumber = (value) => Number(value || 0);

const getDefaultValues = () => {
  const initial = {};
  calculatorCategories.forEach((category) => {
    category.calculators.forEach((calc) => {
      initial[calc.id] = Object.fromEntries(calc.fields.map((field) => [field.key, field.defaultValue]));
    });
  });
  return initial;
};

const getFieldValidation = (field, rawValue) => {
  const value = asNumber(rawValue);
  if (!Number.isFinite(value)) {
    return { hardError: 'Input harus berupa angka valid.', warning: null };
  }

  if (value < field.min || value > field.max) {
    return {
      hardError: `Nilai harus di antara ${field.min} dan ${field.max}${field.unit ? ` ${field.unit}` : ''}.`,
      warning: null
    };
  }

  if (value < field.recommendedMin || value > field.recommendedMax) {
    return {
      hardError: null,
      warning: `Di luar rentang rekomendasi klinis (${field.recommendedMin} - ${field.recommendedMax}${field.unit ? ` ${field.unit}` : ''}).`
    };
  }

  return { hardError: null, warning: null };
};

function App() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortMode, setSortMode] = useState('id');
  const [copiedCalcId, setCopiedCalcId] = useState(null);
  const [values, setValues] = useState(getDefaultValues);

  const defaultValues = useMemo(() => getDefaultValues(), []);

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();
    return calculatorCategories
      .map((category) => ({
        ...category,
        calculators: category.calculators.filter((calc) => {
          const byCategory = selectedCategory === 'all' || selectedCategory === category.id;
          const bySearch = `${calc.name} ${category.title}`.toLowerCase().includes(search);
          return byCategory && bySearch;
        }).sort((a, b) => {
          if (sortMode === 'name') {
            return a.name.localeCompare(b.name);
          }
          return a.id - b.id;
        })
      }))
      .filter((category) => category.calculators.length > 0);
  }, [query, selectedCategory, sortMode]);

  const stats = {
    total: calculatorCategories.reduce((sum, category) => sum + category.calculators.length, 0),
    visible: filteredCategories.reduce((sum, category) => sum + category.calculators.length, 0)
  };

  const resetAll = () => {
    setValues(defaultValues);
    setCopiedCalcId(null);
  };

  const resetCalculator = (calcId) => {
    setValues((prev) => ({
      ...prev,
      [calcId]: defaultValues[calcId]
    }));
  };

  const copyResult = async (calcName, output, unit) => {
    try {
      await navigator.clipboard.writeText(`${calcName}: ${output}${unit ? ` ${unit}` : ''}`);
      setCopiedCalcId(calcName);
      setTimeout(() => setCopiedCalcId(null), 1600);
    } catch {
      setCopiedCalcId(null);
    }
  };

  return (
    <div className="app-shell">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-block brand-block">
            <div className="brand-head">
              <img src="/logo-radiasi.svg" alt="Logo Onkologi Radiasi" className="brand-logo" />
              <div>
                <h1>Onkologi Radiasi</h1>
                <p>Clinical Calculation Workspace</p>
              </div>
            </div>

            <div className="stat-grid">
              <div><strong>{stats.total}</strong><span>Total Kalkulator</span></div>
              <div><strong>{calculatorCategories.length}</strong><span>Kategori</span></div>
              <div><strong>{stats.visible}</strong><span>Ditampilkan</span></div>
            </div>
          </div>

          <div className="sidebar-block filter-block">
            <div className="input-group">
              <label htmlFor="search-calc">Cari kalkulator</label>
              <input
                id="search-calc"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="BED, DVH, IMRT..."
              />
            </div>
            <div className="input-group">
              <label htmlFor="category-select">Filter kategori</label>
              <select id="category-select" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="all">Semua Kategori</option>
                {calculatorCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </div>

            <div className="category-chips">
              <button
                type="button"
                className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua
              </button>
              {calculatorCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="chip-dot" style={{ backgroundColor: category.color }} />
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="content">
          <div className="content-hero">
            <h2>Dashboard Kalkulator Klinis</h2>
            <p>Gunakan panel di kiri untuk mencari dan memfilter kalkulator dengan lebih cepat.</p>
            <div className="hero-actions">
              <div className="input-group inline-input">
                <label htmlFor="sort-mode">Urutkan</label>
                <select id="sort-mode" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="id">Nomor kalkulator</option>
                  <option value="name">Nama kalkulator</option>
                </select>
              </div>
              <button type="button" className="ghost-btn" onClick={resetAll}>Reset semua input</button>
            </div>
          </div>

          {stats.visible === 0 && (
            <div className="empty-state">
              <h3>Tidak ada kalkulator yang cocok</h3>
              <p>Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
              <button type="button" className="ghost-btn" onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}>
                Hapus filter
              </button>
            </div>
          )}

          {filteredCategories.map((category) => (
            <section key={category.id}>
              <h2>{category.title}</h2>
              <div className="grid">
                {category.calculators.map((calc) => {
                  const payload = Object.fromEntries(
                    Object.entries(values[calc.id]).map(([key, value]) => [key, asNumber(value)])
                  );

                  const fieldValidation = Object.fromEntries(
                    calc.fields.map((field) => [field.key, getFieldValidation(field, values[calc.id][field.key])])
                  );
                  const hasHardError = Object.values(fieldValidation).some((state) => state.hardError);

                  const result = !hasHardError ? calc.compute(payload) : null;
                  const output = calc.formatter
                    ? calc.formatter(result)
                    : Number.isFinite(result)
                      ? result.toFixed(4)
                      : '∞';

                  return (
                    <article key={calc.id} className="card" style={{ borderTop: `4px solid ${category.color}` }}>
                      <header>
                        <div>
                          <small>#{calc.id}</small>
                          <h3>{calc.name}</h3>
                        </div>
                        <button type="button" className="text-btn" onClick={() => resetCalculator(calc.id)}>Reset</button>
                      </header>
                      {calc.fields.map((field) => {
                        const state = fieldValidation[field.key];
                        const stateClass = state.hardError ? 'input-error' : state.warning ? 'input-warning' : '';

                        return (
                          <label key={field.key} className={stateClass}>
                            <span>{field.label}</span>
                            <input
                              type="number"
                              step="any"
                              value={values[calc.id][field.key]}
                              onChange={(event) => setValues((prev) => ({
                                ...prev,
                                [calc.id]: {
                                  ...prev[calc.id],
                                  [field.key]: event.target.value
                                }
                              }))}
                            />
                            <small className="helper-text">{field.helperText}</small>
                            {state.hardError && <small className="field-feedback error">{state.hardError}</small>}
                            {!state.hardError && state.warning && <small className="field-feedback warning">{state.warning}</small>}
                          </label>
                        );
                      })}
                      <div className="result">
                        <span>Hasil</span>
                        {hasHardError ? (
                          <strong className="result-blocked">Perbaiki input untuk melihat hasil.</strong>
                        ) : (
                          <strong>{output} {calc.unit !== 'status' ? calc.unit : ''}</strong>
                        )}
                      </div>
                      {!hasHardError && (
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyResult(calc.id, output, calc.unit !== 'status' ? calc.unit : '')}
                        >
                          {copiedCalcId === calc.id ? 'Tersalin ✓' : 'Salin hasil'}
                        </button>
                      )}
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
