import ReactLoading from "react-loading";
import {Col, Row} from "react-bootstrap";

function Loading() {
    return (
        <Row>
            <Col className="d-flex justify-content-center">
                <ReactLoading type="bars" color="#393a39" width="150px" height="150px" className="glossy-background"/>
            </Col>
        </Row>
    );
}

export default Loading;