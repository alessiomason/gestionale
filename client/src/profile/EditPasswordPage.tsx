import {Button, Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {User} from "../models/user";
import {Lock, LockFill} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import profileApis from "../api/profileApis";

interface EditPasswordPageProps {
    readonly user: User
}

function EditPasswordPage(props: EditPasswordPageProps) {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        setInvalidPassword(false);

        if (password === "" || password !== confirmPassword) {
            setInvalidPassword(true);
            return
        }

        profileApis.updatePassword(props.user.id, oldPassword, password)
            .then(_ => navigate("/profile"))
            .catch(err => console.error(err))
    }

    return (
        <Form>
            <Row>
                <h1 className="page-title">Modifica la password</h1>
            </Row>

            <Row>
                <Col/>
                <Col md={8} className="glossy-background">
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><Lock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Vecchia password">
                            <Form.Control type='password' placeholder="Vecchia password" value={oldPassword}
                                          onChange={ev => setOldPassword(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><LockFill/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Nuova password">
                            <Form.Control type='password' placeholder="Nuova password" isInvalid={invalidPassword}
                                          value={password}
                                          onChange={ev => setPassword(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><LockFill/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Conferma nuova password">
                            <Form.Control type='password' placeholder="Conferma nuova password"
                                          isInvalid={invalidPassword}
                                          value={confirmPassword}
                                          onChange={ev => setConfirmPassword(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
                <Col/>
            </Row>

            <Row className="d-flex justify-content-center mt-4">
                <Col md={4} className="d-flex justify-content-center">
                    <Button type="submit" className="glossy-button" onClick={handleSubmit}>Cambia password</Button>
                </Col>
            </Row>
        </Form>
    );
}

export default EditPasswordPage;