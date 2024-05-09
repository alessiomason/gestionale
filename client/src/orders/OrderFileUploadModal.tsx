import {Order} from "../models/order";
import {Col, Form, Modal, Row} from "react-bootstrap";
import React, {useState} from "react";
import GlossyButton from "../buttons/GlossyButton";
import {CloudUpload} from "react-bootstrap-icons";
import "./OrderFileUploadModal.css";
import orderApis from "../api/orderApis";

interface OrderFileUploadModalProps {
    readonly order: Order
    readonly show: boolean
    readonly setShow: React.Dispatch<React.SetStateAction<boolean>>
    readonly afterSubmit: (order: Order) => void
}

function OrderFileUploadModal(props: OrderFileUploadModalProps) {
    const [file, setFile] = useState<File | undefined>();

    function handleSelection(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        setFile(event.target.files ? event.target.files[0] : undefined);
    }

    async function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        const fileName = `Ordine_${props.order.id}-${props.order.year.toString().substring(2)}.pdf`;
        const blob = new Blob([file!], {type: "application/pdf"});

        const form = new FormData();
        form.set("orderFile", blob, fileName);
        try {
            const res = await fetch(`${process.env.REACT_APP_ORDERS_PDF_FOLDER}/upload_order.php`, {
                method: "POST",
                mode: "cors",
                body: form
            });
            if (res.ok) {
                const updatedOrder = props.order;
                updatedOrder.uploadedFile = true;

                orderApis.uploadedOrderFile(updatedOrder)
                    .then(() => props.afterSubmit(updatedOrder))
                    .catch(err => console.log(err));
                props.setShow(false);
            }
        } catch (err: any) {
            console.error(err);
        }
    }

    return (
        <Modal show={props.show} onHide={() => props.setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Carica allegato</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Row>
                        <input type="file" accept="application/pdf" id="upload-file-input" onChange={handleSelection}/>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-center mt-4">
                            <GlossyButton icon={CloudUpload} onClick={handleSubmit}>Carica</GlossyButton>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default OrderFileUploadModal