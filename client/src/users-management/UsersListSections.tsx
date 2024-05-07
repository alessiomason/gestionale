import React, {useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Check2, Copy, Key, Link45deg} from "react-bootstrap-icons";
import {User} from "../models/user";
import dayjs from "dayjs";
import GlossyButton from "../buttons/GlossyButton";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {publicUrl} from "../api/apisValues";

interface RegisteredSectionProps {
    readonly user: User
    readonly resetPassword: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function RegisteredSection(props: RegisteredSectionProps) {
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
            <Row className="mt-3 mb-2">
                <Col/>
                <Col sm={8} className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={props.resetPassword}>Reimposta password</GlossyButton>
                </Col>
                <Col/>
            </Row>
        </>
    );
}

interface NoRegistrationSectionProps {
    readonly user: User
    readonly resetPassword: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function NoRegistrationSection(props: NoRegistrationSectionProps) {
    const expired = dayjs().isAfter(dayjs(props.user.tokenExpiryDate!));

    return (
        <>
            {expired ? <ExpiredRegistrationTokenSection user={props.user} resetPassword={props.resetPassword}/> :
                <OfferRegistrationSection user={props.user}/>}
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
    readonly user: User
}

function OfferRegistrationSection(props: OfferRegistrationSectionProps) {
    const registrationLink = `${publicUrl}signup/${props.user.registrationToken}`;
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
                    questo link scadrà {dayjs(props.user.tokenExpiryDate).format("dddd LL [alle] LT")}.</p>
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
                    <LightGlossyButton icon={copied ? Check2 : (Copy)} className="input-group-button"
                                       onClick={handleCopy}>
                        {copied ? "Link copiato" : "Copia link"}
                    </LightGlossyButton>
                </InputGroup>
            </Row>
        </>
    );
}

export {RegisteredSection, NoRegistrationSection};