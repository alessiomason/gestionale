import React from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Buildings, Clipboard, JournalBookmarkFill} from "react-bootstrap-icons";

interface OrdersFiltersSectionProps {
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly filteringOrderName: string | undefined
    readonly setFilteringOrderName: React.Dispatch<React.SetStateAction<string>>
    readonly filteringJobId: string | undefined
    readonly setFilteringJobId: React.Dispatch<React.SetStateAction<string>>
    readonly filteringSupplier: string | undefined
    readonly setFilteringSupplier: React.Dispatch<React.SetStateAction<string>>
}

function OrdersFiltersSection(props: OrdersFiltersSectionProps) {
    return (
        <Row className="glossy-background ms-0 me-4">
            <Col>
                <Form>
                    <InputGroup>
                        <InputGroup.Text><Clipboard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per identificativo dell'ordine">
                            <Form.Control type="text" placeholder="Filtra per identificativo dell'ordine"
                                          value={props.filteringOrderName}
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
            </Col>
        </Row>
    );
}

export default OrdersFiltersSection;