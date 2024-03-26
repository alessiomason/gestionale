import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {User} from "../models/user";
import {CarFront, EnvelopeAt, Floppy, Telephone} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import userApis from "../api/userApis";
import GlossyButton from "../buttons/GlossyButton";
import {checkValidEmail} from "../functions";

interface EditProfilePageProps {
    readonly user: User
    readonly setDirtyUser: React.Dispatch<React.SetStateAction<boolean>>
}

function EditProfilePage(props: EditProfilePageProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(props.user.email);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [phone, setPhone] = useState(props.user.phone);
    const [car, setCar] = useState(props.user.car);

    function handleEmailCheck() {
        setInvalidEmail(false);

        // empty email is allowed
        if (email && !checkValidEmail(email)) {
            setInvalidEmail(true);
        }
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        handleEmailCheck();

        userApis.updateProfile(email, phone, car)
            .then(() => {
                props.setDirtyUser(true);
                navigate("/profile");
            })
            .catch(err => console.error(err))
    }

    return (
        <Form>
            <Row>
                <h1 className="page-title">Modifica le informazioni personali</h1>
            </Row>
            <Row>
                <Col/>
                <Col md={8} className="glossy-background">
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type='email' placeholder="Email" value={email} isInvalid={invalidEmail}
                                          onChange={ev => setEmail(ev.target.value)}
                                          onBlur={handleEmailCheck}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><Telephone/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Numero di telefono">
                            <Form.Control type='tel' placeholder="Numero di telefono" value={phone}
                                          onChange={ev => setPhone(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><CarFront/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Vettura">
                            <Form.Control type='text' placeholder="Vettura" value={car}
                                          onChange={ev => setCar(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
                <Col/>
            </Row>

            <Row className="d-flex justify-content-center mt-4">
                <Col md={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={Floppy} onClick={handleSubmit}>Salva</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default EditProfilePage;