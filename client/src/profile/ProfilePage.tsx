import {Col, Row} from "react-bootstrap";
import {User} from "../models/user";
import {BoxArrowLeft, CarFront, EnvelopeAt, Key, PencilSquare, Person, Telephone} from "react-bootstrap-icons";
import {useNavigate} from "react-router-dom";
import GlossyButton from "../buttons/GlossyButton";

interface ProfilePageProps {
    readonly user: User
    readonly doLogout: () => void
}

function ProfilePage(props: ProfilePageProps) {
    const navigate = useNavigate();

    return (
        <>
            <Row>
                <h1 className="page-title">{`${props.user.name} ${props.user.surname}`}</h1>
            </Row>

            <Row>
                <Col/>
                <Col md={8}>
                    <Row>
                        <Col className="d-flex justify-content-end me-3">
                            <GlossyButton icon={BoxArrowLeft} onClick={props.doLogout}>Logout</GlossyButton>
                        </Col>
                    </Row>
                    <Row className="glossy-background">
                        <Row className="d-flex align-items-center">
                            <Col sm={2}
                                 className="glossy-background smaller d-flex justify-content-center align-items-center">
                                <Person className="me-1"/> Username
                            </Col>
                            <Col>{props.user.username}</Col>
                        </Row>
                        <Row className="d-flex align-items-center">
                            <Col sm={2}
                                 className="glossy-background smaller d-flex justify-content-center align-items-center">
                                <EnvelopeAt className="me-2"/> Email
                            </Col>
                            <Col>{props.user.email}</Col>
                        </Row>
                        <Row className="d-flex align-items-center">
                            <Col sm={2}
                                 className="glossy-background smaller d-flex justify-content-center align-items-center">
                                <Telephone className="me-1"/> Telefono
                            </Col>
                            <Col>{props.user.phone}</Col>
                        </Row>
                        <Row className="d-flex align-items-center">
                            <Col sm={2}
                                 className="glossy-background smaller d-flex justify-content-center align-items-center">
                                <CarFront className="me-2"/> Vettura
                            </Col>
                            <Col>{props.user.car}</Col>
                        </Row>
                    </Row>
                </Col>
                <Col/>
            </Row>

            <Row className="mt-4">
                <Col/>
                <Col className="d-flex justify-content-center">
                    <GlossyButton icon={PencilSquare} onClick={() => {
                        navigate("/profile/edit")
                    }}>Modifica informazioni personali</GlossyButton>
                </Col>

                <Col className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={() => {
                        navigate("/profile/password")
                    }}>Modifica password</GlossyButton>
                </Col>
                <Col/>
            </Row>
        </>
    );
}

export default ProfilePage;