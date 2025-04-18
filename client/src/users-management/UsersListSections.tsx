import React, {useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import {Check2, Copy, Key, Link45deg, XOctagon} from "react-bootstrap-icons";
import {User} from "../models/user";
import GlossyButton from "../buttons/GlossyButton";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {publicUrl} from "../api/apisValues";
import dayjs from "dayjs";

interface RegisteredSectionProps {
    readonly user: User
    readonly selectedUser: User
    readonly resetPassword: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function RegisteredSection(props: RegisteredSectionProps) {
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

    function showModal(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setShowResetPasswordModal(true);
    }

    return (
        <>
            <Row className="mt-5">
                <h3>Utente registrato</h3>
            </Row>

            <Row>
                <Col>
                    L'utente si è registrato {dayjs(props.selectedUser.registrationDate).format("dddd LL [alle] LT")}.
                </Col>
            </Row>
            {props.selectedUser.id !== props.user.id && <Row className="mt-3 mb-2">
                <Col/>
                <Col sm={8} className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={showModal}>Reimposta password</GlossyButton>
                </Col>
                <Col/>
            </Row>}

            <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confermi di voler reimpostare la password
                        di {props.selectedUser.name} {props.selectedUser.surname}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col className="d-flex flex-column justify-content-center">
                            <GlossyButton icon={Key} className="mb-2"
                                          onClick={props.resetPassword}>Reimposta password</GlossyButton>
                            <GlossyButton icon={XOctagon} className="mt-2"
                                          onClick={() => setShowResetPasswordModal(false)}>Annulla</GlossyButton>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    );
}

interface NoRegistrationSectionProps {
    readonly selectedUser: User
    readonly resetPassword: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function NoRegistrationSection(props: NoRegistrationSectionProps) {
    const expired = dayjs().isAfter(dayjs(props.selectedUser.tokenExpiryDate));

    return (
        <>
            {expired ? <ExpiredRegistrationTokenSection selectedUser={props.selectedUser}
                                                        resetPassword={props.resetPassword}/> :
                <OfferRegistrationSection selectedUser={props.selectedUser}/>}
        </>
    );
}

function ExpiredRegistrationTokenSection(props: NoRegistrationSectionProps) {
    return (
        <>
            <Row className="mt-5">
                <h3>Registrazione dell'utente</h3>
                <p>Il token di registrazione per questo utente è scaduto. Rigeneralo e inviaglielo nuovamente.</p>
            </Row>
            <Row className="mt-3 mb-2">
                <Col/>
                <Col sm={8} className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={props.resetPassword}>Rigenera token</GlossyButton>
                </Col>
                <Col/>
            </Row>
        </>
    );
}

interface OfferRegistrationSectionProps {
    readonly selectedUser: User
}

function OfferRegistrationSection(props: OfferRegistrationSectionProps) {
    const registrationLink = `${publicUrl}signup/${props.selectedUser.registrationToken}`;
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(registrationLink);
        setCopied(true);
    }

    return (
        <>
            <Row className="mt-5">
                <h3>Registrazione dell'utente</h3>
                <p>Invia questo link all'utente per completare la procedura di registrazione.</p>
                <p>Il link scade 2 giorni dopo la generazione:
                    questo link scadrà {dayjs(props.selectedUser.tokenExpiryDate).format("dddd LL [alle] LT")}.</p>
            </Row>

            <Row>
                <InputGroup className="my-2">
                    <InputGroup.Text><Link45deg/></InputGroup.Text>
                    <FloatingLabel controlId="floatingInput" label="Link di registrazione">
                        <Form.Control type="text"
                                      placeholder="Link di registrazione"
                                      value={registrationLink}
                                      disabled/>
                    </FloatingLabel>
                    <LightGlossyButton type="button" icon={copied ? Check2 : (Copy)} className="input-group-button"
                                       onClick={handleCopy}>
                        {copied ? "Link copiato" : "Copia link"}
                    </LightGlossyButton>
                </InputGroup>
            </Row>
        </>
    );
}

export {RegisteredSection, NoRegistrationSection};