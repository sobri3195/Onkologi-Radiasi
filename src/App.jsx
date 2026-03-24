import { useEffect, useMemo, useRef, useState } from 'react';
import { allCalculators, calculatorCategories } from './calculators';
import './styles.css';

const asNumber = (value) => Number(value || 0);
const PINNED_KEY = 'pinned_calculators';
const CUSTOM_PRESET_KEY = 'custom_presets';
const HISTORY_KEY = 'calc_history';
const VALUES_KEY = 'calc_values';

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

const readJsonStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const formatTimestamp = (isoTime) => new Date(isoTime).toLocaleString('id-ID', { hour12: false });

const toCsvValue = (value) => `"${String(value).replaceAll('"', '""')}"`;

const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const getRecentHistoryItems = (history) => Object.entries(history)
  .flatMap(([calcId, items]) => (items || []).map((item) => ({ ...item, calcId: Number(calcId) })))
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 8);

function App() {
  const fileInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortMode, setSortMode] = useState('id');
  const [copiedCalcId, setCopiedCalcId] = useState(null);
  const [values, setValues] = useState(getDefaultValues);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customPresets, setCustomPresets] = useState({});
  const [history, setHistory] = useState({});
  const [selectedPresetIds, setSelectedPresetIds] = useState({});
  const [workspaceStatus, setWorkspaceStatus] = useState('');

  const defaultValues = useMemo(() => getDefaultValues(), []);

  useEffect(() => {
    setPinnedIds(readJsonStorage(PINNED_KEY, []));
    setCustomPresets(readJsonStorage(CUSTOM_PRESET_KEY, {}));
    setHistory(readJsonStorage(HISTORY_KEY, {}));
    setValues((prev) => ({ ...prev, ...readJsonStorage(VALUES_KEY, {}) }));
  }, []);

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRESET_KEY, JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(VALUES_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    if (!workspaceStatus) return;
    const timer = setTimeout(() => setWorkspaceStatus(''), 2200);
    return () => clearTimeout(timer);
  }, [workspaceStatus]);

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
    visible: filteredCategories.reduce((sum, category) => sum + category.calculators.length, 0),
    pinned: pinnedIds.length
  };

  const recentHistory = useMemo(() => getRecentHistoryItems(history), [history]);

  const pinnedCalculators = useMemo(() => {
    const pinnedSet = new Set(pinnedIds);
    return allCalculators.filter((calc) => pinnedSet.has(calc.id));
  }, [pinnedIds]);

  const resetAll = () => {
    setValues(defaultValues);
    setCopiedCalcId(null);
    setSelectedPresetIds({});
  };

  const resetCalculator = (calcId) => {
    setValues((prev) => ({
      ...prev,
      [calcId]: defaultValues[calcId]
    }));
    setSelectedPresetIds((prev) => ({ ...prev, [calcId]: 'default' }));
  };

  const togglePin = (calcId) => {
    setPinnedIds((prev) => (prev.includes(calcId)
      ? prev.filter((id) => id !== calcId)
      : [...prev, calcId]));
  };

  const getPresetOptions = (calc) => {
    const defaults = [
      { id: 'default', name: 'Default', values: defaultValues[calc.id] }
    ];
    return [...defaults, ...(customPresets[calc.id] || [])];
  };

  const applyPreset = (calc, presetId) => {
    const selected = getPresetOptions(calc).find((preset) => preset.id === presetId);
    if (!selected) return;
    setValues((prev) => ({ ...prev, [calc.id]: selected.values }));
    setSelectedPresetIds((prev) => ({ ...prev, [calc.id]: presetId }));
  };

  const saveCustomPreset = (calc) => {
    const presetName = window.prompt('Nama preset baru:');
    if (!presetName) return;
    const item = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      values: values[calc.id]
    };
    setCustomPresets((prev) => ({
      ...prev,
      [calc.id]: [...(prev[calc.id] || []), item]
    }));
    setSelectedPresetIds((prev) => ({ ...prev, [calc.id]: item.id }));
  };

  const deleteCustomPreset = (calcId, presetId) => {
    setCustomPresets((prev) => ({
      ...prev,
      [calcId]: (prev[calcId] || []).filter((preset) => preset.id !== presetId)
    }));
    setSelectedPresetIds((prev) => ({ ...prev, [calcId]: 'default' }));
  };

  const copyResult = async (calcId, calcName, output, unit) => {
    try {
      await navigator.clipboard.writeText(`${calcName}: ${output}${unit ? ` ${unit}` : ''}`);
      setCopiedCalcId(calcId);
      setTimeout(() => setCopiedCalcId(null), 1600);
    } catch {
      setCopiedCalcId(null);
    }
  };

  const addHistory = (calc, input, output) => {
    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      input,
      output,
      unit: calc.unit
    };

    setHistory((prev) => ({
      ...prev,
      [calc.id]: [entry, ...(prev[calc.id] || [])].slice(0, 20)
    }));
  };

  const loadHistoryItem = (calcId, item) => {
    setValues((prev) => ({ ...prev, [calcId]: item.input }));
  };

  const deleteHistoryItem = (calcId, itemId) => {
    setHistory((prev) => ({
      ...prev,
      [calcId]: (prev[calcId] || []).filter((item) => item.id !== itemId)
    }));
  };

  const exportHistoryCsv = (calc) => {
    const items = history[calc.id] || [];
    if (!items.length) return;
    const headers = ['Waktu', 'Input', 'Output', 'Unit'];
    const rows = items.map((item) => [
      formatTimestamp(item.createdAt),
      JSON.stringify(item.input),
      item.output,
      item.unit
    ]);
    downloadCsv(`history-${calc.id}.csv`, [headers, ...rows]);
  };

  const exportWorkspaceBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      values,
      pinnedIds,
      customPresets,
      history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `onkologi-radiasi-backup-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setWorkspaceStatus('Backup berhasil diunduh.');
  };

  const importWorkspaceBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Format backup tidak valid.');
      }

      setValues((prev) => ({ ...prev, ...(parsed.values || {}) }));
      setPinnedIds(Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : []);
      setCustomPresets(parsed.customPresets && typeof parsed.customPresets === 'object' ? parsed.customPresets : {});
      setHistory(parsed.history && typeof parsed.history === 'object' ? parsed.history : {});
      setWorkspaceStatus('Backup berhasil dipulihkan.');
    } catch {
      setWorkspaceStatus('Gagal import backup. Pastikan file JSON valid.');
    } finally {
      event.target.value = '';
    }
  };

  const clearWorkspace = () => {
    const confirmed = window.confirm('Hapus semua data lokal? (pin, preset, history, dan input)');
    if (!confirmed) return;

    setValues(defaultValues);
    setPinnedIds([]);
    setCustomPresets({});
    setHistory({});
    setSelectedPresetIds({});
    localStorage.removeItem(PINNED_KEY);
    localStorage.removeItem(CUSTOM_PRESET_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(VALUES_KEY);
    setWorkspaceStatus('Seluruh data lokal berhasil dihapus.');
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
              <div><strong>{stats.pinned}</strong><span>Pinned</span></div>
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

          <div className="sidebar-block workspace-block">
            <h4>Workspace</h4>
            <div className="workspace-actions">
              <button type="button" className="ghost-btn" onClick={exportWorkspaceBackup}>Export Backup</button>
              <button type="button" className="ghost-btn" onClick={() => fileInputRef.current?.click()}>Import Backup</button>
              <button type="button" className="ghost-btn danger" onClick={clearWorkspace}>Reset Data Lokal</button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={importWorkspaceBackup}
              className="hidden-file"
            />
            {workspaceStatus && <p className="workspace-status">{workspaceStatus}</p>}
          </div>

          {recentHistory.length > 0 && (
            <div className="sidebar-block recent-block">
              <h4>Aktivitas Terbaru</h4>
              <ul>
                {recentHistory.map((item) => {
                  const calc = allCalculators.find((entry) => entry.id === item.calcId);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(calc?.name || '');
                          setSelectedCategory(calc?.categoryId || 'all');
                        }}
                      >
                        <strong>#{item.calcId} {calc?.name || 'Kalkulator'}</strong>
                        <span>{item.output} {item.unit !== 'status' ? item.unit : ''}</span>
                        <small>{formatTimestamp(item.createdAt)}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>

        <main className="content">
          <div className="content-hero">
            <h2>Dashboard Kalkulator Klinis</h2>
            <p>Gunakan panel di kiri untuk mencari, memfilter, backup data, dan meninjau aktivitas terbaru.</p>
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

          {pinnedCalculators.length > 0 && (
            <section>
              <h2>Pinned Calculators</h2>
              <div className="pinned-wrap">
                {pinnedCalculators.map((calc) => (
                  <button
                    key={calc.id}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setQuery(calc.name);
                      setSelectedCategory(calc.categoryId);
                    }}
                  >
                    ⭐ #{calc.id} {calc.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {filteredCategories.map((category) => (
            <section key={category.id}>
              <h2>{category.title} <small>({category.calculators.length})</small></h2>
              <div className="grid">
                {category.calculators.map((calc) => {
                  const payload = Object.fromEntries(
                    Object.entries(values[calc.id]).map(([key, value]) => [key, asNumber(value)])
                  );

                  const fieldValidation = Object.fromEntries(
                    calc.fields.map((field) => [field.key, getFieldValidation(field, values[calc.id][field.key])])
                  );
                  const hasHardError = Object.values(fieldValidation).some((state) => state.hardError);
                  const warningCount = Object.values(fieldValidation).filter((state) => state.warning).length;

                  const result = !hasHardError ? calc.compute(payload) : null;
                  const output = calc.formatter
                    ? calc.formatter(result)
                    : Number.isFinite(result)
                      ? result.toFixed(4)
                      : '∞';

                  const selectedPresetId = selectedPresetIds[calc.id] || 'default';

                  return (
                    <article key={calc.id} className="card" style={{ borderTop: `4px solid ${category.color}` }}>
                      <header>
                        <div>
                          <small>#{calc.id}</small>
                          <h3>{calc.name}</h3>
                        </div>
                        <div className="card-actions">
                          {warningCount > 0 && <span className="warning-pill">⚠ {warningCount}</span>}
                          <button type="button" className="text-btn" onClick={() => togglePin(calc.id)}>
                            {pinnedIds.includes(calc.id) ? '★ Unpin' : '☆ Pin'}
                          </button>
                          <button type="button" className="text-btn" onClick={() => resetCalculator(calc.id)}>Reset</button>
                        </div>
                      </header>
                      <div className="preset-row">
                        <select value={selectedPresetId} onChange={(event) => applyPreset(calc, event.target.value)}>
                          {getPresetOptions(calc).map((preset) => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                          ))}
                        </select>
                        <button type="button" className="text-btn" onClick={() => saveCustomPreset(calc)}>Simpan Preset</button>
                        {(customPresets[calc.id] || []).length > 0 && (
                          <button
                            type="button"
                            className="text-btn"
                            onClick={() => deleteCustomPreset(calc.id, selectedPresetId)}
                            disabled={selectedPresetId === 'default'}
                            title={selectedPresetId === 'default' ? 'Pilih preset custom dulu' : 'Hapus preset terpilih'}
                          >
                            Hapus Preset
                          </button>
                        )}
                      </div>
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
                        <div className="result-actions">
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => copyResult(calc.id, calc.name, output, calc.unit !== 'status' ? calc.unit : '')}
                          >
                            {copiedCalcId === calc.id ? 'Tersalin ✓' : 'Salin hasil'}
                          </button>
                          <button type="button" className="copy-btn secondary" onClick={() => addHistory(calc, values[calc.id], output)}>
                            Simpan riwayat
                          </button>
                        </div>
                      )}
                      <details className="history-box">
                        <summary>Riwayat ({(history[calc.id] || []).length})</summary>
                        <div className="history-actions">
                          <button type="button" className="text-btn" onClick={() => exportHistoryCsv(calc)}>Export CSV</button>
                          <button type="button" className="text-btn" onClick={() => setHistory((prev) => ({ ...prev, [calc.id]: [] }))}>Clear</button>
                        </div>
                        <ul>
                          {(history[calc.id] || []).map((item) => (
                            <li key={item.id}>
                              <small>{formatTimestamp(item.createdAt)}</small>
                              <span>{item.output} {calc.unit !== 'status' ? calc.unit : ''}</span>
                              <div>
                                <button type="button" className="text-btn" onClick={() => loadHistoryItem(calc.id, item)}>Load</button>
                                <button type="button" className="text-btn" onClick={() => deleteHistoryItem(calc.id, item.id)}>Hapus</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
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
