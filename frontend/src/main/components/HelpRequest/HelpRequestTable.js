import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OurTable from "main/components/OurTable";

/** Show the HelpRequest records; editing/deleting is restricted to admins. */
export default function HelpRequestTable({
  helpRequests = [],
  currentUser,
  deleteCallback = () => {},
}) {
  const navigate = useNavigate();
  const isAdmin = currentUser?.root?.role === "ROLE_ADMIN";

  const columns = [
    { Header: "id", accessor: "id" },
    { Header: "Requester Email", accessor: "requesterEmail" },
    { Header: "Team ID", accessor: "teamId" },
    { Header: "Table or Breakout Room", accessor: "tableOrBreakoutRoom" },
    { Header: "Request Time", accessor: "requestTime" },
    { Header: "Explanation", accessor: "explanation" },
    {
      Header: "Solved",
      accessor: "solved",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
  ];

  if (isAdmin) {
    columns.push(
      {
        Header: "Edit",
        id: "edit",
        Cell: ({ row }) => (
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/helprequest/edit/${row.original.id}`)}
          >
            Edit
          </Button>
        ),
      },
      {
        Header: "Delete",
        id: "delete",
        Cell: ({ row }) => (
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteCallback(row.original)}
          >
            Delete
          </Button>
        ),
      },
    );
  }

  return (
    <OurTable
      data={helpRequests}
      columns={columns}
      testid="HelpRequestTable"
    />
  );
}
