require('dotenv').config()
const router = require("express").Router();
const db = require("../db");
const { editUserWeight } = require("../utils/validation");

// Pobranie rodzajów skoków
router.post('/showJumpTypes', (req, res) => {
  const jumpName = req.body.jumpName;
  const sql = 'SELECT * FROM rodzaj_skoku WHERE nazwa = ?';

  db.query(sql, [jumpName], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych: ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Pobranie nazwy skoku
router.post('/showJumpName', (req, res) => {
  const selectedType = req.body.type;

  const sqlJumpType = `SELECT nazwa FROM rodzaj_skoku WHERE skok_id = ?`;
  db.query(sqlJumpType, [selectedType], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/freeDatesOnJump): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych: /freeDatesOnJump' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Pobranie wszystkich wolnych terminów na dany skok
// ogólnie wyswietlanie dat w kalendarzu
router.post('/freeDatesOnJump', (req, res) => {
  const selectedType = req.body.type;

  const sqlJumpType = `SELECT * FROM rodzaj_skoku WHERE skok_id = ?`;
  db.query(sqlJumpType, [selectedType], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/freeDatesOnJump): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych: /freeDatesOnJump' });
    } else {
      if (results.length > 0) {
        const nazwa = results[0].nazwa;
        const liczbaMiejsc = results[0].liczba_miejsc_w_samolocie;

        const sql = `SELECT data_czas FROM planowane_terminy 
          WHERE data_czas > NOW()
          AND status_terminu_id = 1
          AND nazwa = ?
          AND liczba_miejsc_w_samolocie > ?`;

        // Wykonujemy drugie zapytanie, przekazując nazwę z wyników pierwszego zapytania
        db.query(sql, [nazwa, liczbaMiejsc], (err, secondResults) => {
          if (err) {
            console.error('Błąd drugiego zapytania do bazy danych: ' + err.message);
            res.status(500).json({ error: 'Błąd drugiego zapytania do bazy danych' });
          } else {
            // Tutaj możesz użyć wyników drugiego zapytania (secondResults)
            res.status(200).json(secondResults);
          }
        });
      } else {
        res.status(404).json({ error: 'Brak wyników dla podanego typu skoku.' });
      }
    }
  });
});

// Pobranie wszystkich dostępnych terminów na konkretny skok (aktualnego dnia)
// zaznaczenie konkretnej daty w kalendarzu
router.post('/availableDatesByJumpId', (req, res) => {
  const selectedType = req.body.type;
  const selectedDate = req.body.date;

  const sqlJumpType = `SELECT * FROM rodzaj_skoku WHERE skok_id = ?`;

  db.query(sqlJumpType, [selectedType], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/availableDatesByJumpId): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych: /availableDatesByJumpId' });
    } else {
      if (results.length > 0) {
        const jumpName = results[0].nazwa;
        const seatsCount = results[0].liczba_miejsc_w_samolocie;

        const sql = `SELECT * FROM planowane_terminy 
                    WHERE CAST(data_czas as DATE) = CAST(? as DATE)
                    AND data_czas >= CURDATE()
                    AND nazwa = ?
                    AND liczba_miejsc_w_samolocie > ?`;

        db.query(sql, [selectedDate, jumpName, seatsCount], (err, secondResults) => {
          if (err) {
            console.error('Błąd drugiego zapytania do bazy danych: ' + err.message);
            res.status(500).json({ error: 'Błąd drugiego zapytania do bazy danych' });
          } else {
            // Tutaj możesz użyć wyników drugiego zapytania (secondResults)
            res.status(200).json(secondResults);
          }
        });

      } else {
        res.status(404).json({ error: 'Brak wyników dla podanego typu skoku.' });
      }
    }
  });
});

// Pobranie info o szczegółach konkretnego skoku - np. data, godzina, rodzaj soku
router.post('/showJump', (req, res) => {
  const jumpId = req.body.jumpId;
  const sql = `SELECT * FROM planowane_terminy WHERE terminy_id = ?`;

  db.query(sql, [jumpId], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych: ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych' });
    } else {
      // Zwróć wyniki jako odpowiedź w formacie JSON
      res.status(200).json(results);
    }
  });
});

// Pobranie wszystkich wolnych terminów na dany skok
// ogólnie wyswietlanie dat w kalendarzu
router.get('/freeDatesOnAllJumpType', (req, res) => {
  const sql = `SELECT * FROM planowane_terminy 
          WHERE data_czas > NOW()
          AND status_terminu_id = 1
          AND liczba_miejsc_w_samolocie > 0`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/avaiableDatesOnAllJumpType): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych: /avaiableDatesOnAllJumpType' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Pobranie wszystkich dostępnych terminów na konkretny skok (wszystkie rozdaje skoku)
// zaznaczenie konkretnej daty w kalendarzu
router.post('/availableDateAllJumpType', (req, res) => {
  const selectedDate = req.body.date;

  const sql = `SELECT * FROM planowane_terminy 
              WHERE CAST(data_czas as DATE) = CAST(? as DATE)
              AND data_czas >= CURDATE()
              AND liczba_miejsc_w_samolocie > 0`;

  db.query(sql, [selectedDate], (err, results) => {
    if (err) {
      console.error('Błąd drugiego zapytania do bazy danych (/availableDateAllJumpType): ' + err.message);
      res.status(500).json({ error: 'Błąd drugiego zapytania do bazy danych (/availableDateAllJumpType).' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Rezerwacja skoku
router.post("/reserveJump", async (req, res) => {
  try {
    // Aktualizacja wagi użytkownika
    const { error } = editUserWeight.validate({ userWeight: req.body.userWeight });

    if (error) {
      return res.json({ error: error.details[0].message });
    }

    const valuesWeight = [
      req.body.userWeight,
      req.body.mail
    ];

    const sqlWeight = "UPDATE user SET `masa` = ? WHERE `mail` = ?";

    db.query(sqlWeight, valuesWeight, (err, result) => {
      if (err) {
        console.error('Błąd podczas aktualizacji wagi użytkownika: ' + err.message);
        res.status(500).send({ error: 'Wystąpił błąd podczas aktualizacji wagi użytkownika' });
      } else {
        // Rezerwacja skoku po pomyślnej aktualizacji wagi
        const valuesReservation = [
          req.body.userId,
          req.body.planowaneTerminyId,
          req.body.statusSkokuId, // to domyślnie 1- niezrealizowany
          req.body.rodzajSkokuId,
          req.body.platnoscId,
          req.body.cena
        ];

        const sqlReservation = "INSERT INTO rezerwacje_terminow (user_id, planowane_terminy_id, status_skoku_id, rodzaj_skoku_id, platnosc_id, cena) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(sqlReservation, valuesReservation, (err, result) => {
          if (err) {
            console.error('Błąd podczas rezerwacji skoku: ' + err.message);
            res.status(500).send({ error: 'Wystąpił błąd podczas rezerwacji skoku' });
          } else {
            res.send({ Status: 'Success' });
          }
        });
      }
    });
  } catch (error) {
    console.error("Błąd podczas rezerwacji skoku: " + error.message);
    return res.status(500).json({ error: "Błąd podczas rezerwacji skoku" });
  }
});

// wyświetlnie szczegółów dot. skoku na pods. ID
router.post("/showJumpsById", async (req, res) => {
  const jumpId = req.body.jumpId;

  const sql = `SELECT rt.rezerwacje_id, rt.status_skoku_id, u.imie, u.nazwisko, pt.nazwa AS nazwa_skoku, pt.data_czas, pt.miejsce_startu, pt.liczba_miejsc_w_samolocie, sp.nazwa, rt.cena 
  FROM rezerwacje_terminow rt
  JOIN user u ON u.user_id = rt.user_id
  JOIN planowane_terminy pt ON pt.terminy_id = rt.planowane_terminy_id
  JOIN platnosc p ON p.platnosc_id = rt.platnosc_id
  INNER JOIN sposob_platnosci sp ON sp.sposob_platnosci_id = p.sposob_platnosci_id
  WHERE rt.rezerwacje_id = ?`;

  db.query(sql, [jumpId], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/showJumpsById): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych (/showJumpsById).' });
    } else {
      res.status(200).json(results);
    }
  });
});

// myjumps - wyświetlenie rezerwacji
router.post("/showCurrentMyJumpsByMail", async (req, res) => {
  const email = req.body.mail;

  const sql = `SELECT rt.rezerwacje_id, pt.nazwa, pt.data_czas, rt.status_skoku_id
            FROM rezerwacje_terminow rt
            JOIN planowane_terminy pt ON pt.terminy_id = rt.planowane_terminy_id
            JOIN user u ON u.user_id = rt.user_id
            WHERE u.mail = ?
            AND rt.status_skoku_id = 1
            ORDER BY pt.data_czas ASC`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/showCurrentMyJumpsByMail): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych (/showCurrentMyJumpsByMail).' });
    } else {
      res.status(200).json(results);
    }
  });
});

// myjumps - wyświetlenie rezerwacji archiwalych
router.post("/showArchivalMyJumpsByMail", async (req, res) => {
  const email = req.body.mail;

  const sql = `SELECT rt.rezerwacje_id, pt.nazwa, pt.data_czas, rt.status_skoku_id
            FROM rezerwacje_terminow rt
            JOIN planowane_terminy pt ON pt.terminy_id = rt.planowane_terminy_id
            JOIN user u ON u.user_id = rt.user_id
            WHERE u.mail = ?
            AND rt.status_skoku_id = 2
            ORDER BY pt.data_czas DESC`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/showArchivalMyJumpsByMail): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych (/showArchivalMyJumpsByMail).' });
    } else {
      res.status(200).json(results);
    }
  });
});

router.post("/resignJump", async (req, res) => {
  const rezerwacjaId = req.body.rezerwacjaId;
  
  const sql = `DELETE FROM rezerwacje_terminow WHERE rezerwacje_id = ?`;

  db.query(sql, [rezerwacjaId], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych (/resignJump): ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych (/resignJump).' });
    } else {
      res.status(200).json(results);
      // tutaj UPDATE liczby wolnych miejsc w planowane terminy - jeszcze  trzeba to dokończyć!! 
    }
  });
});


module.exports = router;
