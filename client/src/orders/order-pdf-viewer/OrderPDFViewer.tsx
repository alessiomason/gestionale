import React from "react";
import {useParams} from "react-router-dom";
import "./OrderPDFViewer.css";

function OrderPDFViewer() {
    const {orderName} = useParams();
    const attachmentLocation = `${process.env.REACT_APP_ORDERS_PDF_FOLDER}/get_order.php?orderName=${orderName}`;

    return (
        <object title={orderName} data={attachmentLocation} type="application/pdf" className="pdf-viewer">
            <h1>Impossibile visualizzare il file dell'ordine {orderName}.</h1>
        </object>
    );
}

export default OrderPDFViewer;