import {Button, Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {User} from "../models/user";
import {CarFront, EnvelopeAt, Person, Telephone} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import profileApis from "../api/profileApis";

interface EditProfilePageProps {
    user: User,
    setDirtyUser:  React.Dispatch<React.SetStateAction<boolean>>
}

function ProfilePage(props: EditProfilePageProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(props.user.email);
    const [phone, setPhone] = useState(props.user.phone);
    const [car, setCar] = useState(props.user.car);

    function handleEdit() {
        profileApis.updateUser(props.user.id, email, phone, car)
            .then(() => {
                props.setDirtyUser(true);
                navigate("/profile");
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <Row>
                <h1 className="page-title">{`Modifica ${props.user.name} ${props.user.surname}`}</h1>
            </Row>

            <Row>
                <Col/>
                <Col md={8} className="glossy-background">
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type='email' placeholder="Email" value={email}
                                          onChange={ev => setEmail(ev.target.value)}/>
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
                    <Button className="glossy-button" onClick={handleEdit}>Salva</Button>
                </Col>
            </Row>
        </>
    );
}

export default ProfilePage;