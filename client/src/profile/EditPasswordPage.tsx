import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Floppy, Lock, LockFill} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import userApis from "../api/userApis";
import GlossyButton from "../buttons/GlossyButton";
import {checkValidPassword} from "../functions";

function EditPasswordPage() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    function handlePasswordCheck() {
        setInvalidPassword(false);
        setShowPasswordRequirements(false);

        const valid = checkValidPassword(password);
        if (!valid) {
            setInvalidPassword(true);
            setShowPasswordRequirements(true);
        }
        return valid;
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (!handlePasswordCheck() || password !== confirmPassword) {
            setInvalidPassword(true);
            return
        }

        if (oldPassword === "") return

        userApis.updatePassword(oldPassword, password)
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
                                          onChange={ev => setConfirmPassword(ev.target.value)}
                                          onBlur={handlePasswordCheck}/>
                        </FloatingLabel>
                    </InputGroup>

                    {showPasswordRequirements &&
                        <p className="text-center mt-3 error">La password deve essere lunga almeno 8 caratteri, deve
                            contenere una lettera maiuscola, una lettera
                            minuscola e un numero.</p>}
                </Col>
                <Col/>
            </Row>

            <Row className="d-flex justify-content-center mt-4">
                <Col md={4} className="d-flex justify-content-center">
                    <GlossyButton type="submit" icon={Floppy} onClick={handleSubmit}>Cambia
                        password</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default EditPasswordPage;