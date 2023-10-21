import { Container, Nav, Navbar, Form, FormControl, Button, Row, Col, Card, CardGroup, Image } from 'react-bootstrap';
import { AiOutlineUser } from "react-icons/ai";
import { BiHomeAlt } from 'react-icons/bi';
import { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from "axios";
import moment from 'moment';
import { BsArrowLeft, BsArrowRightShort } from 'react-icons/bs';
import styles from "./style.css";

const Reservation = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [mail, setMail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [jumpData, setJumpData] = useState(null);
    const [userData, setUserData] = useState(null); // do wywalenia
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [jumpPrice, setJumpPrice] = useState('');
    const [userWeight, setUserWeight] = useState('');

    const { jumpId } = useParams();

    //sprawdzamy autoryzacje
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3001/api/auth/main')
            .then(res => {
                if (res.data.Status === "Success") {
                    setIsAuth(true);
                    setMail(res.data.mail); //email
                    setUserRole(res.data.userRole); // Ustaw rolę użytkownika
                } else {
                    setIsAuth(false);
                    setMessage(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    }, []);

    const handleLogout = () => {
        axios.get('http://localhost:3001/api/auth/logout')
            .then(res => {
                window.location.href = "/main";
            }).catch(err => console.log(err));
    }

    // pobranie z bazy szczegółów o danym skoku, wagi usera i informacji o metodach płatności
    useEffect(() => {
        if (isAuth) {
            // info o szczegółach skoku - data, godzina, rodzaj soku
            axios.post('http://localhost:3001/api/jumps/showJump', { jumpId: jumpId })
                .then(res => {
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setJumpData(res.data[0]);
                    } else {
                        // Sytuacja, gdy nie znaleziono rekordu
                        console.log('Nie znaleziono rekordu.');
                        // Możesz również ustawić stan lub wyświetlić odpowiednią wiadomość na stronie
                        // np. setJumpData(null) lub setMessage("Nie znaleziono rekordu.")
                    }
                })
                .catch(err => console.log(err));

            // info o masie usera
            axios.get(`http://localhost:3001/api/user/getUserData?email=${mail}`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        // setUserData(res.data[0]);
                        setUserWeight(res.data[0].masa)
                    }
                })
                .catch(err => console.log(err));

            // info o dostępnych metodach płatności
            axios.get(`http://localhost:3001/api/payment/showPaymentMethod`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setPaymentMethods(res.data);
                    }
                })
                .catch(err => console.log(err));
        }
    }, [isAuth, mail, jumpId]);

    // pobranie z bazy ceny dla danego rodzaju soku
    useEffect(() => {
        if (isAuth && jumpData) {
            // Wykonaj zapytanie axios
            axios.post('http://localhost:3001/api/jumps/showJumpTypes', {
                jumpName: jumpData.nazwa
            })
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setJumpPrice(res.data[0].cena);
                    }
                })
                .catch(err => console.log(err));
        }
    }, [isAuth, jumpData]);

    // aktualizacja masy usera
    // const handleEditUserWeight = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post('http://localhost:3001/api/user/updateUserWeight', {
    //             userWeight: userWeight,
    //             mail: mail
    //         });
    //         if (response.data.error) {
    //             setError(response.data.error);
    //             setUpdateSuccess(false);
    //         } else if (response.data.Status === "Success") {
    //             setError('');
    //             setUpdateSuccess(true);
    //         } else {
    //             console.error("Błąd podczas aktualizacji danych!");
    //         }
    //     } catch (error) {
    //         // console.error(error);
    //         console.error('Błąd podczas aktualizacji danych: ' + error.message);
    //     }
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const response = await axios.post('http://localhost:3001/api/jump/reserveJump');
    //         if (response.data.error) {
    //             setError(response.data.error);
    //             setUpdateSuccess(false);
    //         } else if (response.data.Status === "Success") {
    //             setError('');
    //             setUpdateSuccess(true);
    //         } else {
    //             console.error("Błąd podczas aktualizacji danych!");
    //         }
    //     } catch (error) {
    //         // console.error(error);
    //         console.error('Błąd podczas aktualizacji danych: ' + error.message);
    //     }
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = {
            userWeight: userWeight,
            mail: mail,
            //userId: userId, // musisz zdefiniować ten stan
            planowaneTerminyId: jumpData.terminy_id, // id skoku
            statusSkokuId: 1,  // to domyślnie 1- niezrealizowany
            //rodzajSkokuId: rodzajSkokuId, // musisz zdefiniować ten stan
            //platnoscId: platnoscId, // trzeba zdefiniować ten stan
            cena: jumpPrice // cena skoku
        };
    
        try {
            const response = await axios.post('http://localhost:3001/api/user/reserveJump', formData);
            if (response.data.error) {
                setError(response.data.error);
                setUpdateSuccess(false);
            } else if (response.data.Status === "Success") {
                setError('');
                setUpdateSuccess(true);
            } else {
                console.error("Błąd podczas aktualizacji danych!");
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji danych: ' + error.message);
        }
    }

    return (
        <>
            {isAuth ? (
                // User zalogowany
                <>
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Container>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto">
                                    <Nav.Link href="/main"><BiHomeAlt /></Nav.Link>
                                    <Nav.Link href="/offer">OFERTA</Nav.Link>
                                    <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                                </Nav>
                                <Nav.Link href="/userprofile"><Navbar.Brand><AiOutlineUser />  {mail}</Navbar.Brand></Nav.Link>
                                <Button variant="danger" onClick={handleLogout}>WYLOGUJ</Button>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    <Container>
                        <h1 className="text-center">REZERWACJA SKOKU</h1>

                        {/* roboczy ekran: */}
                        <Card className="reservation-container mx-auto">
                            {jumpData && (
                                <div>
                                    <h4>Szczegóły skoku</h4>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Nazwa skoku</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="nazwa"
                                                    value={jumpData.nazwa}
                                                    readOnly
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Data</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="data"
                                                    value={moment(jumpData.data_czas).format('DD.MM.YYYY')}
                                                    readOnly
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Godzina</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="godzina"
                                                    value={moment(jumpData.data_czas).format('HH:mm')}
                                                    readOnly
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            <h4 className="mt-4">Uzupełnij dane</h4>
                            <Row>
                                {/* {userData && (
                                    <Col md={4}>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Masa ciała</Form.Label>
                                            <FormControl
                                                type="number"
                                                placeholder="max 110kg"
                                                name="masa"
                                                value={userData.masa}
                                                onChange={(e) => setUserWeight(e)}
                                            />
                                        </Form.Group>
                                    </Col>
                                )} */}
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Masa ciała</Form.Label>
                                        <FormControl
                                            type="number"
                                            name="userWeight"
                                            value={userWeight}
                                            onChange={(e) => setUserWeight(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Metoda płatności</Form.Label>
                                        <Form.Select as="select" required>
                                            <option value="">Wybierz metodę płatności</option>
                                            {paymentMethods.map((method) => (
                                                <option key={method.sposob_platnosci_id} value={method.nazwa}>
                                                    {method.nazwa}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Do zapłaty</Form.Label>
                                        <FormControl
                                            type="text"
                                            name="cena"
                                            value={`${jumpPrice} PLN`}
                                            readOnly
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={{ span: 2, offset: 10 }}>
                                    <Button variant="success" className="mt-3" onClick={handleSubmit}>POTWIERDŹ SKOK</Button>
                                </Col>
                            </Row>
                        </Card>

                        {updateSuccess && <div className="alert alert-success text-center mt-3">
                            Pomyślnie udało się zarezerwować skok!
                        </div>}
                        {error && <div className="alert alert-danger text-center mt-3">{error}</div>}
                    </Container>
                </>
            ) : (
                <></> // User niezalogowany
            )}
        </>
    );
}

export default Reservation;



{/* <Container className="reservation-container">
    <Row>
        <Col md={{ span: 6, offset: 3 }}>
            <Form.Group as={Row} controlId="formSignupName" className="mb-3">
                <Form.Label column sm={2}>
                    Data skoku
                </Form.Label>
                <Col sm={10}>
                    <FormControl
                        type="date"
                        name="data"
                        required
                    />
                </Col>
            </Form.Group>
        </Col>
    </Row>
    <h5 className="mt-1">Wybierz godzinę</h5>
    <Row>
        <Col>
            <Form>
                <div className='przyciskiradio'>
                    <label class="radio-inline">
                        <input type="radio" name="myRadio" value="10:00" />  10:00
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="myRadio" value="14:00" />  14:00
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="myRadio" value="18:00" />  18:00
                    </label>
                </div>
            </Form>
        </Col>
    </Row>
    <h5 className="mt-4">Uzupełnij dane</h5>
    <Row>
        <Col md={4}>
            <Form.Group className="mb-2">
                <Form.Label>Liczba osób</Form.Label>
                <FormControl
                    type="number"
                    name="peopleNumber"
                    required
                />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group className="mb-2">
                <Form.Label for="rodzajskoku">Rodzaj skoku</Form.Label>
                <FormControl
                    type="text"
                    name="type"
                    required
                />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group className="mb-2">
                <Form.Label>Masa ciała</Form.Label>
                <FormControl
                    type="number"
                    placeholder="max 110kg"
                    name="personWeight"
                    required
                />
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col md={4}>
            <Form.Group className="mb-2">
                <Form.Label>Sposób zapłaty</Form.Label>
                <FormControl
                    type="text"
                    required
                />
            </Form.Group>
        </Col>
        <Col md={4}>
            <Form.Group className="mb-2">
                <Form.Label>Do zapłaty</Form.Label>
                <FormControl
                    type="number"
                    disabled
                />
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col md={{ span: 2, offset: 10 }}>
            <Button variant="success" className="mt-3">POTWIERDŹ SKOK</Button>
        </Col>
    </Row>
</Container> */}