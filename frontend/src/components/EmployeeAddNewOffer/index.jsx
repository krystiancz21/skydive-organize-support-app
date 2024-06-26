import { Container, Nav, Navbar, Form, FormControl, Button, Row, Col } from 'react-bootstrap';
import { AiOutlineUser } from "react-icons/ai";
import { BiHomeAlt } from 'react-icons/bi';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAddNewOffer = () => {
    const [newOfferData, setNewOfferData] = useState({
        jumpName: "",
        jumpPrice: "",
        jumpSeats: "",
        jumpLicense: "",
        jumpWeight: ""
    })

    const [error, setError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [message, setMessage] = useState('');
    const [mail, setMail] = useState('');
    const [userRole, setUserRole] = useState('');

    const [file, setFile] = useState(null);
    const [updateFile, setUpdateFile] = useState(false);

    //sprawdzamy autoryzacje
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:3001/api/auth/employee-add-new-offer')
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

    // Wylogowanie
    const handleLogout = () => {
        axios.get('http://localhost:3001/api/auth/logout')
            .then(res => {
                window.location.href = "/main";
            }).catch(err => console.log(err));
    }

    const handleChange = ({ currentTarget: input }) => {
        setNewOfferData({ ...newOfferData, [input.name]: input.value })
        // console.log(`Nowa wartość pola ${input.name}: ${input.value}`);
        console.log(newOfferData)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadResponse = await axios.post('http://localhost:3001/api/offer/uploadOfferPhoto', formData);
            const filePath = uploadResponse.data.filePath; // Oczekuj odpowiedzi z ścieżką do zapisanego pliku

            axios.post('http://localhost:3001/api/offer/addNewOffer', {
                newOfferData: newOfferData,
                filePath: filePath,
            }).then(res => {
                if (res.data.error) {
                    setError(res.data.error);
                    setUpdateSuccess(false);
                } else {
                    setError('');
                    setUpdateSuccess(true);
                }
            }).catch(err => console.log('Błąd podczas dodawania oferty: ' + err.message));

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Wystąpił błąd podczas przesyłania pliku');
            }
            console.error("Błąd podczas przesyłania pliku: " + error.message);
        }
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
                        <h1 className="text-center">DODAJ RODZAJ SKOKU</h1>
                        <Form className="text-center">
                            <div className='max-width-form'>
                                <Form.Group as={Row} controlId="formEditOfferName" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Nazwa
                                    </Form.Label>
                                    <Col sm={10}>
                                        <FormControl
                                            type="text"
                                            name="jumpName"
                                            value={newOfferData.jumpName}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formEditOfferPrice" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Cena
                                    </Form.Label>
                                    <Col sm={10}>
                                        <FormControl
                                            type="text"
                                            name="jumpPrice"
                                            value={newOfferData.jumpPrice}
                                            onChange={handleChange}

                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formEditOfferSeats" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Liczba miejsc w samolocie
                                    </Form.Label>
                                    <Col sm={10}>
                                        <FormControl
                                            type="text"
                                            name="jumpSeats"
                                            value={newOfferData.jumpSeats}
                                            onChange={handleChange}

                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formEditOfferLicense" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Wymagana licencja
                                    </Form.Label>
                                    <Col sm={10}>
                                        <div>
                                            <Form.Check
                                                type="radio"
                                                inline
                                                label="Tak"
                                                id="requiredLicenseYes"
                                                name="jumpLicense"
                                                value="1"
                                                checked={newOfferData.jumpLicense === "1"}
                                                onChange={handleChange}
                                            />
                                            <Form.Check
                                                type="radio"
                                                inline
                                                label="Nie"
                                                id="requiredLicenseNo"
                                                name="jumpLicense"
                                                value="0"
                                                checked={newOfferData.jumpLicense === "0"}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formEditOfferWeight" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Maksymalna masa
                                    </Form.Label>
                                    <Col sm={10}>
                                        <FormControl
                                            type="text"
                                            name="jumpWeight"
                                            value={newOfferData.jumpWeight}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formEditOfferImg" className="mb-3 align-items-center">
                                    <Form.Label column sm={2}>
                                        Zdjęcie poglądowe
                                    </Form.Label>
                                    <Col sm={10}>
                                        <div className="d-flex flex-column">
                                            <Form.Control
                                                type="file"
                                                accept=".jpg, .jpeg, .png"
                                                onChange={(e) => setFile(e.target.files[0])}
                                            />
                                        </div>
                                    </Col>
                                </Form.Group>
                            </div>
                            {updateSuccess && <div className="alert alert-success">Nowa oferta została dodana!</div>}
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className='mt-4'>
                                <Button variant="success" className="mt-3" id="przycisk2" onClick={handleSubmit}>
                                    DODAJ
                                </Button>
                            </div>
                        </Form>
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

export default EmployeeAddNewOffer
