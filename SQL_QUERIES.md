# SQL Queries - QuizMaker Data Extraction

## 🔍 Znalezienie quizów LINGUŚ i MATMIS

```sql
-- Pokaż wszystkie quizy
SELECT 
  id,
  title,
  quiz_author,
  options,
  quiz_creation_date
FROM wp_aysquiz_quizes
WHERE title LIKE '%LINGUŚ%' OR title LIKE '%MATMIS%'
ORDER BY quiz_creation_date DESC;
```

## 📊 Pobieranie wyników uczestników

```sql
-- Wszystkie wyniki z danymi uczestników
SELECT 
  qr.id as result_id,
  qr.user_id,
  qr.user_name,
  qr.user_email,
  qr.user_phone,
  JSON_EXTRACT(qr.user_data, '$.age') as age,
  JSON_EXTRACT(qr.user_data, '$.imie') as first_name,
  JSON_EXTRACT(qr.user_data, '$.nazwisko') as last_name,
  qr.score,
  qr.max_score,
  ROUND((qr.score / qr.max_score) * 100, 2) as percentage,
  qr.quiz_id,
  q.title as quiz_name,
  qr.created_at as date_taken,
  qr.end_date,
  TIMESTAMPDIFF(SECOND, qr.created_at, qr.end_date) as duration_seconds
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE (q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%')
  AND qr.created_at >= '2025-03-01'
ORDER BY qr.score DESC, qr.end_date DESC;
```

## 🎯 Wyniki podzielone na kategorie wiekowe

```sql
SELECT 
  qr.user_name,
  JSON_EXTRACT(qr.user_data, '$.age') as age,
  CASE 
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 6 AND 7 THEN '6-7 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 8 AND 9 THEN '8-9 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 10 AND 11 THEN '10-11 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 12 AND 13 THEN '12-13 lat'
    ELSE 'Inna'
  END as category,
  qr.score,
  q.title as quiz_name,
  qr.created_at
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%'
ORDER BY 
  category,
  qr.score DESC;
```

## 📈 Statystyki per kategoria

```sql
SELECT 
  q.title as quiz_name,
  CASE 
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 6 AND 7 THEN '6-7 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 8 AND 9 THEN '8-9 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 10 AND 11 THEN '10-11 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 12 AND 13 THEN '12-13 lat'
    ELSE 'Inna'
  END as category,
  COUNT(*) as participants,
  ROUND(AVG(qr.score), 2) as avg_score,
  MAX(qr.score) as max_score,
  MIN(qr.score) as min_score
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%'
GROUP BY quiz_name, category
ORDER BY quiz_name, category;
```

## 🏆 Top 10 uczestników per konkurs

```sql
-- LINGUŚ
SELECT 
  qr.user_name,
  JSON_EXTRACT(qr.user_data, '$.age') as age,
  qr.score,
  qr.created_at,
  RANK() OVER (ORDER BY qr.score DESC) as ranking
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE q.title LIKE '%LINGUŚ%'
ORDER BY qr.score DESC
LIMIT 10;

-- MATMIS
SELECT 
  qr.user_name,
  JSON_EXTRACT(qr.user_data, '$.age') as age,
  qr.score,
  qr.created_at,
  RANK() OVER (ORDER BY qr.score DESC) as ranking
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE q.title LIKE '%MATMIS%'
ORDER BY qr.score DESC
LIMIT 10;
```

## 📋 Eksport do CSV format

```sql
-- Format gotowy do eksportu CSV
SELECT 
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(qr.user_data, '$.imie')), 
           SUBSTRING_INDEX(qr.user_name, ' ', 1)) as 'Imię',
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(qr.user_data, '$.nazwisko')),
           SUBSTRING_INDEX(qr.user_name, ' ', -1)) as 'Nazwisko',
  JSON_EXTRACT(qr.user_data, '$.age') as 'Wiek',
  CASE 
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 6 AND 7 THEN '6-7 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 8 AND 9 THEN '8-9 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 10 AND 11 THEN '10-11 lat'
    WHEN JSON_EXTRACT(qr.user_data, '$.age') BETWEEN 12 AND 13 THEN '12-13 lat'
    ELSE 'Inna'
  END as 'Kategoria',
  qr.score as 'Punkty',
  ROUND((qr.score / qr.max_score) * 100, 2) as 'Procent',
  DATE_FORMAT(qr.created_at, '%Y-%m-%d') as 'Data',
  q.title as 'Konkurs'
FROM wp_aysquiz_reports qr
JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
WHERE (q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%')
ORDER BY q.title, qr.score DESC;
```

## 🔎 Sprawdzenie struktury tabel

```sql
-- Struktura tabeli quizów
DESCRIBE wp_aysquiz_quizes;

-- Struktura tabeli wyników
DESCRIBE wp_aysquiz_reports;

-- Przykładowy rekord
SELECT * FROM wp_aysquiz_reports LIMIT 1;

-- Sprawdź jakie dane są w user_data (JSON)
SELECT 
  id,
  user_name,
  user_data
FROM wp_aysquiz_reports
LIMIT 5;
```

## 📝 Uwagi

1. **Prefix tabeli**: Upewnij się że używasz prawidłowego prefixu (`wp_` lub innego)
2. **JSON fields**: Struktura `user_data` może się różnić w zależności od konfiguracji QuizMaker
3. **Daty**: Format daty może wymagać konwersji w zależności od strefy czasowej
4. **Performance**: Dla dużych zbiorów danych dodaj indeksy na kolumny `quiz_id` i `created_at`

## 💡 Użycie w WordPress Agent

```javascript
const response = await fetch('https://blgdhfcosqjzrutncbbr.supabase.co/functions/v1/wordpress-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: `Wykonaj zapytanie SQL:
    
    SELECT 
      qr.user_name,
      JSON_EXTRACT(qr.user_data, '$.age') as age,
      qr.score,
      q.title as quiz_name,
      qr.created_at
    FROM wp_aysquiz_reports qr
    JOIN wp_aysquiz_quizes q ON qr.quiz_id = q.id
    WHERE q.title LIKE '%LINGUŚ%' OR q.title LIKE '%MATMIS%'
    ORDER BY qr.score DESC
    `
  })
});
```

---

**Data utworzenia:** 25.03.2026  
**Wersja:** 1.0
