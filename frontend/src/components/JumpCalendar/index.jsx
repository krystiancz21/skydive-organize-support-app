import { Container, Nav, Navbar, Button, Row, Col } from 'react-bootstrap';
import { AiOutlineUser } from "react-icons/ai";
import { BiHomeAlt } from 'react-icons/bi'
import styles from "./style.css"
import axios from "axios";
import Calendar from 'react-calendar';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';

const SmallFooter = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="text-center footer fixed-bottom">
            <p className="m-0 stopa">System wspomagający organizację skoków spadochronowych | Autorzy: Krystian Czapla, Kacper Czajka, Mariusz Choroś | &copy; {year}</p>
        </footer>
    );
};

const JumpCalendar = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [message, setMessage] = useState('');
    const [mail, setMail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [date, setDate] = useState(new Date());
    const [availableJumps, setAvailableJumps] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [jumpName, setJumpName] = useState('');

    const { type } = useParams();

    //sprawdzamy autoryzacje
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3001/api/auth/userprofile')
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

    const handleDateChange = (date) => {
        let currentDate = moment(date).format('YYYY-MM-DD');
        setDate(currentDate);
    }

    // wyswietlanie dat w kalendarzu
    useEffect(() => {
        axios.post('http://localhost:3001/api/jumps/showJumpName', { type: type })
            .then(res => {
                setJumpName(res.data[0].nazwa);
            })
            .catch(err => console.log(err));

        axios.post('http://localhost:3001/api/jumps/freeDatesOnJump', { type: type })
            .then(res => {
                const formattedDates = res.data.map(item => {
                    const date = new Date(item.data_czas);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    return formattedDate;
                });
                setAvailableDates(formattedDates);
            })
            .catch(err => console.log(err));
    }, [type]);

    // podświetlanie pól w kalendarzu ( wolny termin)
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = moment(date).format('YYYY-MM-DD');
            if (availableDates.includes(dateStr)) {
                return <div style={{ backgroundColor: 'green', height: '100%', width: '100%', position: 'absolute', opacity: 0.2 }}></div>;
            }
        }
        return null;
    };

    // Szczegóły dot. danego terminu (konkretna data/godzina skoku wybrana przez usera)
    useEffect(() => {
        axios.post('http://localhost:3001/api/jumps/availableDatesByJumpId', { date: date, type: type })
            .then(res => {
                setAvailableJumps(res.data); // Ustaw dostępne skoki na podstawie wyników z serwera
                console.log(res.data);
            })
            .catch(err => console.log(err));
    }, [date, type]);

    // Nawigacja dla poszczególnych ról
    const getNavbar = (role, mail, handleLogout) => {
        switch (role) {
            case 'klient':
                return (<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Container>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/main"><BiHomeAlt /></Nav.Link>
                                <Nav.Link href="/offer">OFERTA</Nav.Link>
                                <Nav.Link href="/jump-dates">TERMINY SKOKÓW</Nav.Link>
                                <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                            </Nav>
                            <Nav.Link href="/userprofile"><Navbar.Brand><AiOutlineUser />  {mail}</Navbar.Brand></Nav.Link>
                            <Button variant="danger" onClick={handleLogout}>WYLOGUJ</Button>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                );
            case 'pracownik':
                return (
                    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                        <Container>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto">
                                    <Nav.Link href="/main"><BiHomeAlt /></Nav.Link>
                                    <Nav.Link href="/offer">OFERTA</Nav.Link>
                                    <Nav.Link href="/jump-dates">TERMINY SKOKÓW</Nav.Link>
                                    <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                                    <Nav.Link href="/employee-users-accounts">KONTA UŻYTKOWNIKÓW</Nav.Link>
                                    <Nav.Link href="/employee-manage-jumps">ZARZĄDZANIE SKOKAMI</Nav.Link>
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
                                    <Nav.Link href="/jump-dates">TERMINY SKOKÓW</Nav.Link>
                                    <Nav.Link href="/messages">WIADOMOŚCI</Nav.Link>
                                    <Nav.Link href="/employee-users-accounts">KONTA UŻYTKOWNIKÓW</Nav.Link>
                                    <Nav.Link href="/employee-manage-jumps">ZARZĄDZANIE SKOKAMI</Nav.Link>
                                    <Nav.Link href="/owner-financial-overview">PODSUMOWANIE FINANSOWE</Nav.Link>
                                </Nav>
                                <Nav.Link href="/userprofile"><Navbar.Brand><AiOutlineUser />  {mail}</Navbar.Brand></Nav.Link>
                                <Button variant="danger" onClick={handleLogout}>WYLOGUJ</Button>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                );
            default:
                return null;
        }
    }

    return (
        <>
            {isAuth ? (
                // User zalogowany
                <>
                    {getNavbar(userRole, mail, handleLogout)}
                    <Container>
                        <Row className='mt-5'>
                            <Col>
                                <h2>Wybierz termin i zarezerwuj skok</h2>
                                <h5>Rodzaj skoku: <b>{jumpName}</b></h5>
                                <div className="my-3">
                                    <p>
                                        <span className="text-success">Kolor zielony</span> - oznacza wolne terminy
                                    </p>
                                </div>
                                <div className="my-3">
                                    <Calendar
                                        value={date}
                                        onChange={handleDateChange}
                                        minDate={new Date()}
                                        tileContent={tileContent}
                                    />
                                </div>
                            </Col>
                            <Col className="text-center">
                                <h2>Dostępne skoki w wybranym terminie</h2>
                                {availableJumps.length > 0 ? (
                                    <>
                                        <ul className="list-unstyled w-50 mx-auto">
                                            {availableJumps.map((jump, index) => (
                                                <li key={index} className="jump-avaiable-date-container">
                                                    <p className="mb-1">Data: {moment(jump.data_czas).format('DD.MM.YYYY')}</p>
                                                    <p className="mb-1">Godzina: {moment(jump.data_czas).format('HH:mm')}</p>
                                                    <p className="mb-1">Liczba wolnych miejsc: {jump.liczba_miejsc_w_samolocie}</p>
                                                    <Link to={`/reservation/${jump.terminy_id}`}>
                                                        <Button variant="primary" className="mt-2">Zarezerwuj</Button>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p>W tym dniu nie ma zaplanowanych skoków. Wybierz inną datę.</p>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </Container>
                    <div className='pt-5 pb-5'></div>
                    <SmallFooter />
                </>
            ) : (
                <></> // User niezalogowany
            )}
        </>


    )
}

export default JumpCalendar