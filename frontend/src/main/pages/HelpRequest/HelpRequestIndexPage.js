import React from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { useCurrentUser } from "main/utils/currentUser";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

export const helpRequestDeleteParams = (id) => ({
  url: "/api/HelpRequest",
  method: "DELETE",
  params: { id },
});

export default function HelpRequestIndexPage() {
  const currentUser = useCurrentUser();
  const { data: helpRequests, error, status } = useBackend(
    ["/api/HelpRequest/all"],
    { method: "GET", url: "/api/HelpRequest/all" },
    [],
  );

  const deleteMutation = useBackendMutation(
    helpRequestDeleteParams,
    { onSuccess: () => toast("HelpRequest deleted") },
    ["/api/HelpRequest/all"],
  );

  return (
    <Container>
      <h1>HelpRequests</h1>
      {currentUser?.root?.role === "ROLE_ADMIN" && (
        <Button as={Link} to="/helprequest/create" className="mb-3">
          Create HelpRequest
        </Button>
      )}
      {status === "error" && <p role="alert">{String(error)}</p>}
      <HelpRequestTable
        helpRequests={helpRequests ?? []}
        currentUser={currentUser}
        deleteCallback={(request) => deleteMutation.mutate(request.id)}
      />
    </Container>
  );
}
