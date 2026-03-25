# 🚀 SZYBKI START - Manager Konkursów LINGUŚ & MATMIS

## 1. GitHub (2 minuty)

```bash
cd /mnt/user-data/outputs/lingus-matmis-manager
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/szachmacik/lingus-matmis-manager.git
git push -u origin main
```

## 2. Coolify (3 minuty)

1. Zaloguj się: https://coolify.ofshore.dev
2. **+ New Resource** → **Application**
3. Wybierz repo: `szachmacik/lingus-matmis-manager`
4. Ustaw:
   - Port: **3000**
   - Domain: **lingus-matmis.ofshore.dev**
5. **Deploy**

## 3. Podłącz dane z QuizMaker (10 minut)

### A) Przez WordPress Agent (najprostsze)

Edytuj `src/lingus-matmis-manager.jsx`, linia 23:

```javascript
const response = await fetch('https://blgdhfcosqjzrutncbbr.supabase.co/functions/v1/wordpress-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: `Pokaż wyniki quizów LINGUŚ i MATMIS z QuizMaker w formacie JSON: imię, nazwisko, wiek, punkty, data`
  })
});
```

### B) Sprawdź strukturę tabel QuizMaker

```bash
# Zaloguj się do WordPress przez SSH lub phpMyAdmin
# Znajdź tabele:
wp_aysquiz_quizes      # quizy
wp_aysquiz_reports     # wyniki
wp_aysquiz_questions   # pytania

# Przykładowe zapytanie:
SELECT * FROM wp_aysquiz_quizes WHERE title LIKE '%LINGUŚ%';
```

## 4. Użycie (1 minuta)

1. Otwórz: **https://lingus-matmis.ofshore.dev**
2. Wybierz konkurs: LINGUŚ lub MATMIS
3. Wybierz kategorię wiekową
4. Kliknij **"Eksportuj do CSV"** → import do Google Sheets
5. Kliknij **"Generuj"** obok uczestnika → pobierz dyplom PNG

## 📊 Import CSV do Google Sheets

1. Otwórz https://sheets.google.com
2. **File** → **Import** → **Upload**
3. Wybierz pobrany CSV
4. **Import location**: Replace spreadsheet
5. **Separator**: Comma
6. **Import**

## 🎨 Dostosowanie dyplomów

Edytuj `src/lingus-matmis-manager.jsx`, funkcja `generateDiploma()`:

```javascript
// Zmień kolory
ctx.strokeStyle = '#d4af37'; // złoty (ramka)
ctx.fillStyle = '#2c3e50';   // ciemnoszary (tekst)

// Dodaj logo
const logo = new Image();
logo.src = 'https://twoja-domena.pl/logo.png';
ctx.drawImage(logo, 50, 50, 200, 200);
```

## ⚡ Test lokalny

```bash
npm install
npm run dev
# Otwórz: http://localhost:3000
```

## 🆘 Problem?

**Brak wyników?**
→ Sprawdź console (F12) czy API zwraca dane

**WordPress Agent timeout?**
→ Użyj bezpośredniego SQL query (opcja B)

**Dyplomy nie działają?**
→ Sprawdź czy przeglądarka obsługuje Canvas API

---

**Czas wdrożenia:** ~15 minut  
**Gotowe do użycia!** 🎉
