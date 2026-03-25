# 🏆 Manager Konkursów LINGUŚ & MATMIS

System zarządzania wynikami konkursów szachowych dla dzieci z automatycznym eksportem do Google Sheets i generatorem dyplomów w stylu QuizMaker.

## ✨ Funkcjonalności

- ✅ **Pobieranie wyników** z QuizMaker przez WordPress Agent
- ✅ **Filtrowanie** po konkursach (LINGUŚ/MATMIS) i kategoriach wiekowych
- ✅ **Statystyki** - liczba uczestników, średni wynik, najlepszy wynik
- ✅ **Eksport do CSV** - gotowy do importu do Google Sheets
- ✅ **Generator dyplomów** - eleganckie dyplomy w formacie landscape z ramką i ozdobami
- ✅ **Automatyczne kategorie** - podział na grupy wiekowe: 6-7, 8-9, 10-11, 12-13 lat

## 🚀 Wdrożenie na Coolify

### 1. Utwórz nowe repozytorium GitHub

```bash
git init
git add .
git commit -m "Initial commit: LINGUŚ & MATMIS Manager"
git remote add origin https://github.com/szachmacik/lingus-matmis-manager.git
git push -u origin main
```

### 2. Dodaj aplikację w Coolify

1. Zaloguj się do [Coolify](https://coolify.ofshore.dev)
2. Kliknij **+ New Resource** → **Application**
3. Wybierz GitHub repo: `szachmacik/lingus-matmis-manager`
4. Ustaw:
   - **Port**: 3000
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Domain**: `lingus-matmis.ofshore.dev` (lub inna subdomena)

### 3. Ustaw zmienne środowiskowe (opcjonalne)

W Coolify → Settings → Environment Variables:

```env
VITE_WORDPRESS_URL=https://www.sklep.linguachess.com
VITE_WORDPRESS_AGENT_URL=https://blgdhfcosqjzrutncbbr.supabase.co/functions/v1/wordpress-agent
```

### 4. Deploy

Kliknij **Deploy** - aplikacja będzie dostępna pod adresem:
`https://lingus-matmis.ofshore.dev`

## 🔌 Podłączenie prawdziwych danych z QuizMaker

### Opcja A: Przez WordPress Agent (zalecane)

Edytuj plik `src/lingus-matmis-manager.jsx`, funkcja `fetchResults()`:

```javascript
const fetchResults = async () => {
  setLoading(true);
  try {
    const response = await fetch('https://blgdhfcosqjzrutncbbr.supabase.co/functions/v1/wordpress-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: `Wykonaj zapytanie SQL do bazy WordPress:
        
        SELECT 
          u.ID as user_id,
          u.display_name,
          JSON_EXTRACT(qr.user_data, '$.age') as age,
          qr.score,
          qr.quiz_id,
          q.title as quiz_name,
          qr.created_at
        FROM wp_aysquiz_reports qr
        JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
        LEFT JOIN wp_users u ON qr.user_id = u.ID
        WHERE q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%'
        ORDER BY qr.created_at DESC
        `
      })
    });
    
    const data = await response.json();
    
    // Parse wyniki
    const parsedResults = data.results.map(row => ({
      id: row.user_id,
      firstName: row.display_name.split(' ')[0],
      lastName: row.display_name.split(' ')[1] || '',
      age: parseInt(row.age) || 0,
      score: parseInt(row.score) || 0,
      contest: row.quiz_name.includes('LINGUŚ') ? 'LINGUŚ' : 'MATMIS',
      date: row.created_at
    }));
    
    setResults(parsedResults);
  } catch (error) {
    console.error('Error fetching results:', error);
  }
  setLoading(false);
};
```

### Opcja B: Bezpośrednio przez WordPress REST API

```javascript
const fetchResults = async () => {
  setLoading(true);
  try {
    // Pobierz quizy LINGUŚ i MATMIS
    const quizzesResponse = await fetch(
      'https://www.sklep.linguachess.com/wp-json/wp/v2/quiz-maker-quizzes',
      {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:6E0W lYX5 8EKL HDL2 xw1s WVgd')
        }
      }
    );
    
    const quizzes = await quizzesResponse.json();
    const targetQuizzes = quizzes.filter(q => 
      q.title.includes('LINGUŚ') || q.title.includes('MATMIS')
    );
    
    // Pobierz wyniki dla każdego quizu
    const allResults = [];
    for (const quiz of targetQuizzes) {
      const resultsResponse = await fetch(
        `https://www.sklep.linguachess.com/wp-json/wp/v2/quiz-maker-results?quiz_id=${quiz.id}`,
        {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:6E0W lYX5 8EKL HDL2 xw1s WVgd')
          }
        }
      );
      
      const results = await resultsResponse.json();
      allResults.push(...results.map(r => ({
        id: r.id,
        firstName: r.user_name.split(' ')[0],
        lastName: r.user_name.split(' ')[1] || '',
        age: parseInt(r.user_age) || 0,
        score: parseInt(r.score) || 0,
        contest: quiz.title.includes('LINGUŚ') ? 'LINGUŚ' : 'MATMIS',
        date: r.created_date
      })));
    }
    
    setResults(allResults);
  } catch (error) {
    console.error('Error fetching results:', error);
  }
  setLoading(false);
};
```

### Opcja C: Bezpośrednie zapytanie SQL do bazy danych

Jeśli znasz strukturę tabel QuizMaker w WordPress, możesz wykonać bezpośrednie zapytanie SQL.

**Typowe tabele QuizMaker:**
- `wp_aysquiz_quizes` - quizy
- `wp_aysquiz_reports` - wyniki
- `wp_aysquiz_questions` - pytania

**Przykładowe zapytanie SQL:**

```sql
SELECT 
  qr.id,
  qr.user_name,
  qr.user_email,
  JSON_EXTRACT(qr.user_data, '$.age') as age,
  qr.score,
  qr.quiz_id,
  q.title as quiz_name,
  qr.created_at
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE (q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%')
  AND qr.created_at >= '2025-03-01'
ORDER BY qr.score DESC
```

## 📊 Eksport do Google Sheets

### Automatyczny eksport (zaawansowane)

Dodaj integrację z Google Sheets API:

1. Utwórz projekt w Google Cloud Console
2. Włącz Google Sheets API
3. Pobierz credentials.json
4. Dodaj kod eksportu:

```javascript
import { google } from 'googleapis';

const exportToGoogleSheets = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const values = filteredResults.map(r => [
    r.firstName,
    r.lastName,
    r.age,
    categories[getCategoryForAge(r.age)],
    r.score,
    r.date
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    range: `${selectedContest}!A2`,
    valueInputOption: 'RAW',
    resource: { values }
  });
};
```

### Prosty CSV import do Google Sheets

1. Kliknij "Eksportuj do CSV"
2. Otwórz [Google Sheets](https://sheets.google.com)
3. File → Import → Upload → Wybierz pobrany CSV
4. Ustaw:
   - Import location: **Replace spreadsheet**
   - Separator type: **Comma**
   - Convert text to numbers: **Yes**

## 🎨 Dostosowanie dyplomów

Edytuj funkcję `generateDiploma()` w `src/lingus-matmis-manager.jsx`:

### Zmiana kolorów

```javascript
// Kolor tła
gradient.addColorStop(0, '#f8f9fa'); // jasny
gradient.addColorStop(1, '#e9ecef'); // ciemny

// Kolor ramki
ctx.strokeStyle = '#d4af37'; // złoty
ctx.strokeStyle = '#c0c0c0'; // srebrny
ctx.strokeStyle = '#cd7f32'; // brązowy

// Kolor tekstu
ctx.fillStyle = '#2c3e50'; // ciemnoszary
ctx.fillStyle = '#1a1a1a'; // czarny
```

### Dodanie loga

```javascript
const generateDiploma = async (participant) => {
  // ... existing code ...
  
  // Dodaj logo
  const logo = new Image();
  logo.src = 'https://www.sklep.linguachess.com/logo.png';
  logo.onload = () => {
    ctx.drawImage(logo, 50, 50, 200, 200);
  };
};
```

### Zmiana orientacji (Portrait)

```javascript
// Portrait A4
canvas.width = 2480;
canvas.height = 3508;
```

## 🛠️ Rozwój lokalny

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Aplikacja dostępna pod: http://localhost:3000

# Build produkcyjny
npm run build

# Podgląd buildu
npm run preview
```

## 📁 Struktura projektu

```
lingus-matmis-manager/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main app component
│   └── lingus-matmis-manager.jsx  # Manager component
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # Ta dokumentacja
```

## 🔒 Bezpieczeństwo

**UWAGA:** Nie commituj credentials do repozytorium!

Dodaj do `.gitignore`:

```
.env
.env.local
credentials.json
```

Używaj zmiennych środowiskowych w Coolify dla wrażliwych danych.

## 🆘 Troubleshooting

### Problem: Brak wyników

**Rozwiązanie:** Sprawdź w konsoli deweloperskiej (F12) czy API zwraca dane.

### Problem: WordPress Agent timeout

**Rozwiązanie:** Użyj bezpośredniego WordPress REST API lub SQL query.

### Problem: Dyplomy nie generują się

**Rozwiązanie:** Sprawdź czy canvas jest wspierany przez przeglądarkę. Upewnij się że Canvas API działa.

### Problem: CSV nie importuje się do Google Sheets

**Rozwiązanie:** Upewnij się że separator to przecinek, nie średnik.

## 📞 Wsparcie

Skontaktuj się przez:
- Telegram: @ogarniacz_ofshore_bot
- Email: maciej.koziej01@gmail.com

## 📝 TODO / Roadmap

- [ ] Automatyczny eksport do Google Sheets przez API
- [ ] Wysyłanie dyplomów mailem do uczestników
- [ ] Ranking top 10 uczestników
- [ ] Porównanie wyników LINGUŚ vs MATMIS
- [ ] Panel administracyjny do edycji kategorii wiekowych
- [ ] Bulk generator dyplomów (dla wszystkich naraz)
- [ ] Integracja z Telegram Guardian Bot dla powiadomień

---

**Wersja:** 1.0.0  
**Data utworzenia:** 25.03.2026  
**Autor:** Claude + Maciej Koziej  
**Licencja:** MIT
