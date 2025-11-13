import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {ArrowLeftSquare, ArrowRightSquare} from "react-bootstrap-icons";
import {Job} from "../models/job";
import {humanize} from "../functions";
import "./JobsTable.css";

interface JobsTableProps {
    readonly jobs: Job[]
    readonly isAdministrator: boolean
}

function JobsTable(props: JobsTableProps) {
    const [pageNumber, setPageNumber] = useState(() => {
        const number = sessionStorage.getItem("jobsPageNumber");
        return number ? parseInt(number) : 0;
    });
    const increasablePageNumber = (pageNumber + 1) * 100 <= props.jobs.length;
    const decreasablePageNumber = pageNumber > 0;

    const navigate = useNavigate();

    // length changes at every filter change
    useEffect(() => {
        setPageNumber(0);
    }, [props.jobs.length]);

    useEffect(() => {
        sessionStorage.setItem("jobsPageNumber", pageNumber.toString());
    }, [pageNumber]);

    function increasePageNumber() {
        if (increasablePageNumber) {
            setPageNumber(prevPageNumber => prevPageNumber + 1);
        }
    }

    function decreasePageNumber() {
        if (decreasablePageNumber) {
            setPageNumber(prevPageNumber => prevPageNumber - 1);
        }
    }

    function handleClick(job: Job) {
        if (props.isAdministrator) {    // only administrators can access the job details page
            navigate(`/jobs/${job.id}`);
        }
    }

    return (
        <Row className="glossy-background">
            <Row className="mb-2">
                <Col className="d-flex justify-content-between">
                    <ArrowLeftSquare
                        className={decreasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                        onClick={decreasePageNumber}/>
                    <p className="text-center">
                        Pagina {pageNumber + 1} di {Math.ceil(props.jobs.length / 100)}
                    </p>
                    <ArrowRightSquare
                        className={increasablePageNumber ? "clickable-arrow" : "unclickable-arrow"}
                        onClick={increasePageNumber}/>
                </Col>
            </Row>

            <Table hover={props.isAdministrator} responsive>
                <thead>
                <tr>
                    <th>Commessa</th>
                    <th>Cliente</th>
                    <th>Cliente finale</th>
                    <th>Oggetto</th>
                    <th>Numero ordine</th>
                    <th>Ore totali</th>
                </tr>
                </thead>

                <tbody>
                {props.jobs
                    .sort((a, b) => -1 * a.id.localeCompare(b.id))
                    .slice(pageNumber * 100, (pageNumber + 1) * 100)
                    .map(job => {
                        let className = "";
                        if (!job.active) {
                            className = "closed-job";
                        }
                        if (job.inProgress) {
                            className += " in-progress-job";
                            className = className.trim();
                        }

                        return (
                            <tr className={props.isAdministrator ? undefined : "unhoverable"} key={job.id}
                                onClick={() => handleClick(job)}>
                                <td className={className}>{job.id}</td>
                                <td>{job.client}</td>
                                <td>{job.finalClient}</td>
                                <td>{job.subject}</td>
                                <td>{job.orderName}</td>
                                <td>{humanize(job.totalWorkedHours, 2)}</td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </Table>
        </Row>
    );
}

export default JobsTable;