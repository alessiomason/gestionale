import {Row, Table} from "react-bootstrap";
import {Job} from "../models/job";
import {useNavigate} from "react-router-dom";
import {CheckCircle, XCircle} from "react-bootstrap-icons";
import "./JobsTable.css";

interface JobsTableProps {
    readonly jobs: Job[]
}

function JobsTable(props: JobsTableProps) {
    const navigate = useNavigate();

    return (
        <Row className="glossy-background">
            <Table hover responsive>
                <thead>
                <tr>
                    <th>Commessa</th>
                    <th>Cliente</th>
                    <th>Cliente finale</th>
                    <th>Oggetto</th>
                    <th>Numero ordine</th>
                    <th>Attiva</th>
                </tr>
                </thead>

                <tbody>
                {props.jobs
                    .sort((a, b) => -1 * a.id.localeCompare(b.id))
                    .slice(0, 100)
                    .map(job => {
                        return (
                            <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}>
                                <td>{job.id}</td>
                                <td>{job.client}</td>
                                <td>{job.finalClient}</td>
                                <td>{job.subject}</td>
                                <td>{job.orderName}</td>
                                <td>{job.active ? <CheckCircle/> : <XCircle/>}</td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </Table>

            {props.jobs.length > 100 && <p className="table-footer mt-2 mb-0">Usa la ricerca per mostrare più commesse...</p>}
        </Row>
    );
}

export default JobsTable;