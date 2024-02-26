import React, {useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Check2, Icon, Key, Link45deg} from "react-bootstrap-icons";
import Copy from "../new-bootstrap-icons/Copy";
import {User} from "../models/user";
import dayjs from "dayjs";
import GlossyButton from "../buttons/GlossyButton";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {publicUrl} from "../api/apisValues";

interface UsersListSectionProps {
    readonly user: User
}

function RegisteredSection(props: UsersListSectionProps) {
    return (
        <>
            <Row className="mt-5">
                <h3>Utente registrato</h3>
            </Row>

            <Row>
                <Col>
                    L'utente si è registrato {dayjs(props.user.registrationDate).format("dddd LL [alle] LT")}.
                </Col>
            </Row>
            <Row className="mt-3">
                <Col/>
                <Col sm={8} className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={() => {
                    }}>Reimposta password (non disponibile)</GlossyButton>
                </Col>
                <Col/>
            </Row>
        </>
    );
}

function NoRegistrationSection(props: UsersListSectionProps) {
    const registrationLink = `${publicUrl}signup/${props.user.registrationToken}`;
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(registrationLink);
        setCopied(true);
    }

    return (
        <>
            <Row className="mt-4">
                <h3>Registrazione dell'utente</h3>
                <p>Invia questo link all'utente per completare la procedura di registrazione.</p>
                <p>Il link scade 7 giorni dopo la generazione:
                    questo link scadrà {dayjs(props.user.tokenExpiryDate).format("dddd LL [alle] LT")}.</p>
            </Row>

            <Row>
                <InputGroup className="mt-2">
                    <InputGroup.Text><Link45deg/></InputGroup.Text>
                    <FloatingLabel controlId="floatingInput" label="Link di registrazione">
                        <Form.Control type="text"
                                      placeholder="Link di registrazione"
                                      value={registrationLink}
                                      disabled/>
                    </FloatingLabel>
                    <LightGlossyButton icon={copied ? Check2 : (Copy as Icon)} className="input-group-button"
                                       onClick={handleCopy}>
                        {copied ? "Link copiato" : "Copia link"}
                    </LightGlossyButton>
                </InputGroup>
            </Row>
        </>
    );
}

export {RegisteredSection, NoRegistrationSection};