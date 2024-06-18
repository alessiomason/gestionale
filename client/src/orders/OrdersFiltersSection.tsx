import React from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {Buildings, Clipboard, JournalBookmarkFill, XOctagon} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";

interface OrdersFiltersSectionProps {
    readonly filteringOrderName: string | undefined
    readonly setFilteringOrderName: React.Dispatch<React.SetStateAction<string>>
    readonly filteringJobId: string | undefined
    readonly setFilteringJobId: React.Dispatch<React.SetStateAction<string>>
    readonly filteringSupplier: string | undefined
    readonly setFilteringSupplier: React.Dispatch<React.SetStateAction<string>>
}

function OrdersFiltersSection(props: OrdersFiltersSectionProps) {
    function clearFilters(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        props.setFilteringOrderName("");
        props.setFilteringJobId("");
        props.setFilteringSupplier("");
    }

    return (
        <Form>
            <Row className="glossy-background smaller m-0">
                <Col>
                    <InputGroup>
                        <InputGroup.Text><Clipboard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per n° ordine">
                            <Form.Control type="text" placeholder="Filtra per n° ordine"
                                          value={props.filteringOrderName}
                                          onChange={ev => props.setFilteringOrderName(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup>
                        <InputGroup.Text><JournalBookmarkFill/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per commessa">
                            <Form.Control type="text" placeholder="Filtra per commessa" value={props.filteringJobId}
                                          onChange={ev => props.setFilteringJobId(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup>
                        <InputGroup.Text><Buildings/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Filtra per fornitore">
                            <Form.Control type="text" placeholder="Filtra per fornitore" value={props.filteringSupplier}
                                          onChange={ev => props.setFilteringSupplier(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
                <Col sm={1} className="d-flex align-items-center me-4">
                    <GlossyButton icon={XOctagon} onClick={clearFilters}/>
                </Col>
            </Row>
        </Form>
    );
}

export default OrdersFiltersSection;