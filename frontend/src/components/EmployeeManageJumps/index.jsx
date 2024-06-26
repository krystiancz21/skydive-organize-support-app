import { Container, Nav, Navbar, Button, Row, Col } from 'react-bootstrap';
import { AiOutlineUser } from "react-icons/ai";
import { BiHomeAlt } from 'react-icons/bi'
import { BsArrowRightShort, BsBagPlusFill, BsFillCalendarPlusFill, BsFillCalendarCheckFill } from 'react-icons/bs';
import { ImCancelCircle } from 'react-icons/im';
import { MdAddCard } from "react-icons/md";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./style.css";


const EmployeeManageJumps = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [mail, setMail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [message, setMessage] = useState('');

    //sprawdzamy autoryzacje
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3001/api/auth/employee-create-account')
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
                    <Container className={styles.content}>
                        <h1 className="text-center">ZARZĄDZANIE SKOKAMI</h1>
                        <Row >
                            <Col className="text-center">
                                <Link to='/employee-plan-jumps'>
                                    <Button variant="secondary" className="mt-3" id="btn-edit">
                                        <BsFillCalendarPlusFill /> Zaplanuj skoki <BsArrowRightShort />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Link to='/employee-cancel-jumps'>
                                    <Button variant="secondary" className="mt-3" id="btn-jumps">
                                        <ImCancelCircle /> Odwołaj skoki <BsArrowRightShort />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Link to='/employee-payment-method'>
                                    <Button variant="secondary" className="mt-3" id="btn-jumps">
                                        <MdAddCard /> Metody płatności <BsArrowRightShort />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Link to='/employee-add-new-offer'>
                                    <Button variant="secondary" className="mt-3" id="btn-jumps">
                                        <BsBagPlusFill /> Oferta <BsArrowRightShort />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Link to='/employee-manage-reservation'>
                                    <Button variant="secondary" className="mt-3" id="btn-jumps">
                                        <BsFillCalendarCheckFill /> Rezerwacje <BsArrowRightShort />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </Container>
                    <div className='pt-5 pb-5'></div>
                    <SmallFooter />
                </>
            ) : (
                // User niezalogowany
                <></>
            )
            }
        </>
    );
}

export default EmployeeManageJumps
