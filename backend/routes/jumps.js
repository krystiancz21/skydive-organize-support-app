require('dotenv').config()
const router = require("express").Router();
const db = require("../db");

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

// Pobranie wszystkich dostępnych terminów na konkretny skok (od aktualnego dnia)
router.post('/availableDates', (req, res) => {
  const selectedDate = req.body.date;
  const selectedType = req.body.selectedType;

  const sql = `SELECT * FROM planowane_terminy 
                 WHERE CAST(data_czas as DATE) = CAST(? as DATE)
                 AND data_czas >= CURDATE()
                 AND nazwa = ?
                 AND liczba_miejsc_w_samolocie > 0`;

  db.query(sql, [selectedDate, selectedType], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych: ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Pobranie wolnych godzin terminów w wybranym dniu na konkretny rodzaj skoku 
router.post('/freeDates', (req, res) => {
  const selectedType = req.body.selectedType;
  const sql = `SELECT data_czas FROM planowane_terminy 
               WHERE liczba_miejsc_w_samolocie != 0
               AND nazwa = ?
               AND data_czas > NOW()`;

  db.query(sql, [selectedType], (err, results) => {
    if (err) {
      console.error('Błąd zapytania do bazy danych: ' + err.message);
      res.status(500).json({ error: 'Błąd zapytania do bazy danych' });
    } else {
      // Zwróć wyniki jako odpowiedź w formacie JSON
      res.status(200).json(results);
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

module.exports = router;
