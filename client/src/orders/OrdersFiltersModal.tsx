import React from "react";
import {Col, FloatingLabel, Form, InputGroup, Modal, Row} from "react-bootstrap";
import {Buildings, Clipboard, Funnel, JournalBookmarkFill, XOctagon} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";

interface OrdersFiltersModalProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly filteringOrderName: string | undefined
    readonly setFilteringOrderName: React.Dispatch<React.SetStateAction<string | undefined>>
    readonly filteringJobId: string | undefined
    readonly setFilteringJobId: React.Dispatch<React.SetStateAction<string | undefined>>
    readonly filteringSupplier: string | undefined
    readonly setFilteringSupplier: React.Dispatch<React.SetStateAction<string | undefined>>
}

function OrdersFiltersModal(props: OrdersFiltersModalProps) {
    function clearFilters() {
        props.setFilteringOrderName(undefined);
        props.setFilteringJobId(undefined);
        props.setFilteringSupplier(undefined);
        props.setShow(false);
    }

    return (
        <Modal size="lg" show={props.show} onHide={() => props.setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Filtri</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <InputGroup>
                        <InputGroup.Text><Clipboard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per identificativo dell'ordine">
                            <Form.Control type="text" placeholder="Filtra per identificativo dell'ordine" value={props.filteringOrderName}
                                          onChange={ev => props.setFilteringOrderName(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-3">
                        <InputGroup.Text><JournalBookmarkFill/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per commessa">
                            <Form.Control type="text" placeholder="Filtra per commessa" value={props.filteringJobId}
                                          onChange={ev => props.setFilteringJobId(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-3">
                        <InputGroup.Text><Buildings/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per fornitore">
                            <Form.Control type="text" placeholder="Filtra per fornitore" value={props.filteringSupplier}
                                          onChange={ev => props.setFilteringSupplier(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Form>

                <Row>
                    <Col className="mt-3 d-flex justify-content-evenly">
                        <GlossyButton icon={Funnel} onClick={() => props.setShow(false)}>Filtra</GlossyButton>
                        <GlossyButton icon={XOctagon} onClick={clearFilters}>Azzera i filtri</GlossyButton>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}

export default OrdersFiltersModal;