import { useMemo, useState } from 'react';
import { allCalculators, calculatorCategories } from './calculators';
import './styles.css';

const asNumber = (v) => Number(v || 0);

function App() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [values, setValues] = useState(() => {
    const initial = {};
    allCalculators.forEach((calc) => {
      initial[calc.id] = Object.fromEntries(calc.fields.map(([key, _label, defaultValue]) => [key, defaultValue]));
    });
    return initial;
  });

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

  const stats = {
    total: allCalculators.length,
    visible: filteredCategories.reduce((sum, cat) => sum + cat.calculators.length, 0),
    categories: calculatorCategories.length
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Onkologi Radiasi</h1>
        <p>Admin Panel Perhitungan Klinis</p>
        <div className="stat-grid">
          <div><strong>{stats.total}</strong><span>Fitur</span></div>
          <div><strong>{stats.categories}</strong><span>Kategori</span></div>
          <div><strong>{stats.visible}</strong><span>Aktif</span></div>
        </div>

        <label>Pilih modul</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {calculatorCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>

        <label>Cari fitur</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BED, DVH, IMRT..."
        />
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

                return (
                  <article key={calc.id} className="card" style={{ borderTop: `4px solid ${category.color}` }}>
                    <header>
                      <small>#{calc.id}</small>
                      <h3>{calc.name}</h3>
                    </header>
                    {calc.fields.map(([fieldKey, label]) => (
                      <label key={fieldKey}>
                        <span>{label}</span>
                        <input
                          type="number"
                          step="any"
                          value={values[calc.id][fieldKey]}
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
