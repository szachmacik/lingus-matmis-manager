import React, { useState, useEffect, useRef } from 'react';

const LingusMisManager = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContest, setSelectedContest] = useState('LINGUŚ');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatingDiploma, setGeneratingDiploma] = useState(null);
  const canvasRef = useRef(null);

  // Age categories
  const categories = {
    'cat1': '6-7 lat',
    'cat2': '8-9 lat',
    'cat3': '10-11 lat',
    'cat4': '12-13 lat',
  };

  // Fetch results from WordPress
  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://blgdhfcosqjzrutncbbr.supabase.co/functions/v1/wordpress-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: `Pobierz wszystkie wyniki quizów QuizMaker dla konkursów LINGUŚ i MATMIS wraz z danymi uczestników (imię, nazwisko, wiek, punkty, data)`
        })
      });
      
      const data = await response.json();
      
      // Mock data for development (replace with real data parser)
      const mockResults = [
        { id: 1, firstName: 'Anna', lastName: 'Kowalska', age: 7, score: 85, contest: 'LINGUŚ', date: '2025-03-20' },
        { id: 2, firstName: 'Jan', lastName: 'Nowak', age: 9, score: 92, contest: 'LINGUŚ', date: '2025-03-20' },
        { id: 3, firstName: 'Maria', lastName: 'Wiśniewska', age: 11, score: 78, contest: 'MATMIS', date: '2025-03-21' },
        { id: 4, firstName: 'Piotr', lastName: 'Lewandowski', age: 13, score: 88, contest: 'MATMIS', date: '2025-03-21' },
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Categorize by age
  const getCategoryForAge = (age) => {
    if (age >= 6 && age <= 7) return 'cat1';
    if (age >= 8 && age <= 9) return 'cat2';
    if (age >= 10 && age <= 11) return 'cat3';
    if (age >= 12 && age <= 13) return 'cat4';
    return 'other';
  };

  // Filter results
  const filteredResults = results.filter(r => {
    const matchesContest = r.contest === selectedContest;
    const category = getCategoryForAge(r.age);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    return matchesContest && matchesCategory;
  });

  // Export to Google Sheets (CSV format)
  const exportToCSV = () => {
    const headers = ['Imię', 'Nazwisko', 'Wiek', 'Kategoria', 'Punkty', 'Data'];
    const rows = filteredResults.map(r => [
      r.firstName,
      r.lastName,
      r.age,
      categories[getCategoryForAge(r.age)] || 'Inna',
      r.score,
      r.date
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedContest}_wyniki_${selectedCategory}.csv`;
    link.click();
  };

  // Generate diploma
  const generateDiploma = async (participant) => {
    setGeneratingDiploma(participant.id);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (landscape A4 at 300 DPI)
    canvas.width = 3508;
    canvas.height = 2480;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 40;
    ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);
    
    ctx.strokeStyle = '#c19a2e';
    ctx.lineWidth = 10;
    ctx.strokeRect(160, 160, canvas.width - 320, canvas.height - 320);

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 180px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('DYPLOM', canvas.width / 2, 480);

    // Contest name
    ctx.font = 'bold 120px Georgia';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(`Konkurs ${participant.contest}`, canvas.width / 2, 680);

    // Award text
    ctx.font = '80px Georgia';
    ctx.fillStyle = '#34495e';
    ctx.fillText('Niniejszym potwierdza się, że', canvas.width / 2, 900);

    // Participant name
    ctx.font = 'bold 140px Georgia';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText(`${participant.firstName} ${participant.lastName}`, canvas.width / 2, 1100);

    // Achievement text
    ctx.font = '70px Georgia';
    ctx.fillStyle = '#34495e';
    ctx.fillText(`uczestniczył(a) w konkursie ${participant.contest}`, canvas.width / 2, 1280);
    ctx.fillText(`i uzyskał(a) wynik: ${participant.score} punktów`, canvas.width / 2, 1400);
    
    // Category
    const category = categories[getCategoryForAge(participant.age)];
    ctx.font = '60px Georgia';
    ctx.fillText(`Kategoria wiekowa: ${category}`, canvas.width / 2, 1550);

    // Date
    ctx.font = '55px Georgia';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText(`Data: ${participant.date}`, canvas.width / 2, 1850);

    // Decorative elements
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(400, 400, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(canvas.width - 400, 400, 80, 0, Math.PI * 2);
    ctx.fill();

    // Download diploma
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `Dyplom_${participant.firstName}_${participant.lastName}_${participant.contest}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setGeneratingDiploma(null);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            🏆 Manager Konkursów
          </h1>
          <p style={{
            margin: '1rem 0 0',
            fontSize: '1.2rem',
            opacity: 0.95
          }}>
            LINGUŚ & MATMIS - Wyniki i Dyplomy
          </p>
        </div>

        {/* Filters */}
        <div style={{
          padding: '2rem',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#666' }}>
              Konkurs:
            </label>
            <select
              value={selectedContest}
              onChange={(e) => setSelectedContest(e.target.value)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                background: 'white',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="LINGUŚ">LINGUŚ</option>
              <option value="MATMIS">MATMIS</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#666' }}>
              Kategoria wiekowa:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                background: 'white',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="all">Wszystkie kategorie</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToCSV}
            disabled={filteredResults.length === 0}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              background: filteredResults.length === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: filteredResults.length === 0 ? 'not-allowed' : 'pointer',
              marginLeft: 'auto',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📊 Eksportuj do CSV
          </button>
        </div>

        {/* Stats */}
        <div style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {filteredResults.length}
            </div>
            <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>
              Uczestników
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {filteredResults.length > 0 ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length) : 0}
            </div>
            <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>
              Średni wynik
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {filteredResults.length > 0 ? Math.max(...filteredResults.map(r => r.score)) : 0}
            </div>
            <div style={{ opacity: 0.9, marginTop: '0.5rem' }}>
              Najlepszy wynik
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div style={{ padding: '2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f0f0f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }} />
              Ładowanie wyników...
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              Brak wyników dla wybranych filtrów
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Imię</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Nazwisko</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Wiek</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Kategoria</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Punkty</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Data</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Dyplom</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults
                    .sort((a, b) => b.score - a.score)
                    .map((result, index) => (
                    <tr
                      key={result.id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        background: index % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}
                    >
                      <td style={{ padding: '1rem' }}>{result.firstName}</td>
                      <td style={{ padding: '1rem' }}>{result.lastName}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{result.age}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {categories[getCategoryForAge(result.age)]}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#667eea', fontSize: '1.1rem' }}>
                        {result.score}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                        {result.date}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => generateDiploma(result)}
                          disabled={generatingDiploma === result.id}
                          style={{
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: 'none',
                            background: generatingDiploma === result.id ? '#ccc' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            cursor: generatingDiploma === result.id ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: '0 2px 8px rgba(240, 147, 251, 0.4)'
                          }}
                          onMouseEnter={(e) => !generatingDiploma && (e.target.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          {generatingDiploma === result.id ? '⏳' : '🏆'} Generuj
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for diploma generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default LingusMisManager;
