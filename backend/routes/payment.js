require('dotenv').config()
const router = require("express").Router();
const db = require("../db");
const { addPaymentMethod } = require("../utils/validation");

router.get('/showPaymentMethod', (req, res) => {
    const sql = 'SELECT * FROM sposob_platnosci';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Błąd zapytania do bazy danych: ' + err.message);
            res.status(500).json({ error: 'Błąd zapytania do bazy danych' });
        } else {
            // Zwróć wyniki jako odpowiedź w formacie JSON
            res.status(200).json(results);
        }
    });
});

// Dodawanie nowej płatności
router.post("/addPayment", (req, res) => {
    // const { data_platnosci, wplacona_kwota, status_platnosci_id, sposob_platnosci_id } = req.body;
    const values = [
        req.body.data_platnosci,
        req.body.wplacona_kwota,
        req.body.status_platnosci_id,
        req.body.sposob_platnosci_id,
    ];

    const sql = "INSERT INTO platnosc (data_platnosci, wplacona_kwota, status_platnosci_id, sposob_platnosci_id) VALUES (?, ?, ?, ?)";

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Błąd podczas dodawania płatności: ' + err.message);
            res.status(500).send({ error: 'Wystąpił błąd podczas dodawania płatności' });
        } else {
            res.send({ Status: 'Success', platnosc_id: result.insertId });
        }
    });
});

router.post("/addNewPaymentMethod", (req, res) => {
    const paymentName = req.body.paymentName;
    const { error } = addPaymentMethod.validate(req.body);

    if (error) {
        return res.json({ error: error.details[0].message });
    }

    const sql = "INSERT INTO sposob_platnosci (nazwa) VALUES (?)";

    db.query(sql, [paymentName], (err, result) => {
        if (err) {
            console.error('Błąd podczas dodawania nowej metody płatności (/addNewPaymentMethod): ' + err.message);
            res.status(500).send({ error: 'Wystąpił błąd podczas dodawania nowej metody płatności(/addNewPaymentMethod)' });
        } else {
            res.status(200).json(result);
        }
    });
});

router.post('/deletePaymentMethod', (req, res) => {
    const paymentId = req.body.paymentId;

    const sql = "DELETE FROM sposob_platnosci WHERE sposob_platnosci_id = ?";

    db.query(sql, [paymentId], (err, result) => {
        if (err) {
            console.error('Błąd podczas usuwania metody płatności (/deletePaymentMethod): ' + err.message);
            res.status(500).send({ error: 'Wystąpił błąd podczas usuwania metody płatności(/deletePaymentMethod)' });
        } else {
            res.status(200).json(result);
        }
    });
});


module.exports = router;