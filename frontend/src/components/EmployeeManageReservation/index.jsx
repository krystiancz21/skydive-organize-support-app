import { Container, Nav, Navbar, Button, Row, Col } from 'react-bootstrap';
import { AiOutlineUser } from "react-icons/ai";
import { BiHomeAlt } from 'react-icons/bi'
import { Link } from "react-router-dom";
import moment from 'moment';
import { useState, useEffect } from "react";
import axios from "axios";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

const EmployeeManageReservation = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [message, setMessage] = useState('');
    const [mail, setMail] = useState('');
    const [userRole, setUserRole] = useState('');

    const [currentReservatoins, setCurrentReservatoins] = useState([]);
    const [confirmReservations, setConfirmReservations] = useState([]);
    const [archivalReservations, setArchivalReservations] = useState([]);

    const [selectedReservationType, setSelectedReservationType] = useState(2);
    const getReservations = () => {
        switch (selectedReservationType) {
            case 1:
                return confirmReservations;
            case 2:
                return currentReservatoins;
            case 3:
                return archivalReservations;
            default:
                return [];
        }
    };

    //sprawdzamy autoryzacje
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3001/api/auth/employee-plan-jumps')
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
            .catch(err => console.log(err.message));

        axios.get('http://localhost:3001/api/jumps/showEmployeeNotConfirmReservations')
            .then(res => {
                setCurrentReservatoins(res.data);
                // console.log(res.data)
            })
            .catch(err => console.log(err.message));

        axios.get('http://localhost:3001/api/jumps/showEmployeeConfirmReservations')
            .then(res => {
                setConfirmReservations(res.data);
                // console.log(res.data)
            })
            .catch(err => console.log(err.message));

        axios.get('http://localhost:3001/api/jumps/showEmployeeArchivalReservations')
            .then(res => {
                setArchivalReservations(res.data);
                // console.log(res.data)
            })
            .catch(err => console.log(err.message));

    }, []);

    const handleLogout = () => {
        axios.get('http://localhost:3001/api/auth/logout')
            .then(res => {
                window.location.href = "/main";
            }).catch(err => console.log(err));
    }

    const handleConfirmJump = (rezerwacje_id, platnosc_id) => {
        axios.post('http://localhost:3001/api/payment/employeeConfirmPayment', {
            reservationId: rezerwacje_id,
            platnoscId: platnosc_id
        })
            .then(res => {
                window.location.reload();
            })
            .catch(err => console.log(err.message));
    }

    // Nawigacja dla poszczególnych ról
    const getNavbar = (role, mail, handleLogout) => {
        switch (role) {
            case 'pracownik':
                return (
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Container>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto">
                                    <Nav.Link href="/main"><BiHomeAlt /></Nav.Link>
                                    <Nav.Link href="/offer">OFERTA</Nav.Link>
                                    <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                                    <Nav.Link href="/employee-users-accounts">KONTA UŻYTKOWNIKÓW</Nav.Link>
                                </Nav>
                                <Nav.Link href="/userprofile"><Navbar.Brand><AiOutlineUser /> {mail}</Navbar.Brand></Nav.Link>
                                <Button variant="danger" onClick={handleLogout}>WYLOGUJ</Button>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                );
            case 'admin':
                return (
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Container>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto d-flex align-items-center" style={{ fontSize: '14px' }}>
                                    <Nav.Link href="/main"><BiHomeAlt /></Nav.Link>
                                    <Nav.Link href="/offer">OFERTA</Nav.Link>
                                    <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                                    <Nav.Link href="/employee-users-accounts">KONTA UŻYTKOWNIKÓW</Nav.Link>
                                    <Nav.Link href="/owner-financial-overview">PODSUMOWANIE FINANSOWE</Nav.Link>
                                </Nav>
                                <Nav.Link href="/userprofile"><Navbar.Brand><AiOutlineUser /> {mail}</Navbar.Brand></Nav.Link>
                                <Button variant="danger" onClick={handleLogout}>WYLOGUJ</Button>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                );
            default:
                return null;
        }
    }

    const SmallFooter = () => {
        const year = new Date().getFullYear();

        return (
            <footer className="text-center footer fixed-bottom">
                <p className="m-0 stopa">System wspomagający organizację skoków spadochronowych | Autorzy: Krystian Czapla, Kacper Czajka, Mariusz Choroś | &copy; {year}</p>
            </footer>
        );
    };

    return (
        <>
            {isAuth ? (
                <>
                    {getNavbar(userRole, mail, handleLogout)}
                    <Container>
                        <h1 className="text-center">REZERWACJE</h1>
                        <div className="d-flex justify-content-center pb-4">
                            <ToggleButtonGroup type="radio" name="options" defaultValue={2} onChange={setSelectedReservationType}>
                                <ToggleButton id="tbg-radio-1" value={1} variant="secondary">
                                    Potwierdzone
                                </ToggleButton>
                                <ToggleButton id="tbg-radio-2" value={2} variant="secondary">
                                    Niepotwierdzone
                                </ToggleButton>
                                <ToggleButton id="tbg-radio-3" value={3} variant="secondary">
                                    Archiwalne
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>

                        {getReservations().length > 0 ? (
                            <>
                                {getReservations().map((item, index) => (
                                    <Row key={index} className="accounts-container text-center mb-3">
                                        <Row className='align-items-center justify-content-center'>
                                            <Col>{item.nazwa}</Col>
                                            <Col>{item.imie} {item.nazwisko}</Col>
                                            <Col>Data: {moment(item.data_czas).format('DD.MM.YYYY HH:mm')}</Col>
                                            {/* <Col>{item.sposob_platnosci} - {item.wplacona_kwota} PLN</Col> */}
                                            {selectedReservationType === 2 ? (
                                                <Col>{item.sposob_platnosci} - {item.cena} PLN</Col>
                                            ) : (
                                                <Col>{item.sposob_platnosci} - {item.wplacona_kwota} PLN</Col>
                                            )}
                                            {selectedReservationType === 1 || selectedReservationType === 3 ? (
                                                <Col>Wpłata: {moment(item.data_platnosci).format('DD.MM.YY HH:mm')}</Col>
                                            ) : (
                                                <></>
                                            )}
                                            <Col>
                                                {selectedReservationType === 1 || selectedReservationType === 3 ? (
                                                    <Button disabled variant="success">
                                                        Potwierdzono
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline-success"
                                                        onClick={() => handleConfirmJump(item.rezerwacje_id, item.platnosc_id)}
                                                    >
                                                        Potwierdź płatność
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </Row>
                                ))}
                            </>
                        ) : (
                            <>
                                <p className='text-center'>Brak rezerwacji.</p>
                            </>
                        )}
                    </Container>
                    <div className='pt-5 pb-5'></div>
                    <SmallFooter />
                </>
            ) : (
                // User niezalogowany
                <>
                </>
            )}
        </>
    );
}

export default EmployeeManageReservation