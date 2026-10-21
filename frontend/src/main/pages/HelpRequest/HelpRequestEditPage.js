import React from "react";
import { Container } from "react-bootstrap";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

export const helpRequestPutParams = (request) => ({
  url: "/api/HelpRequest",
  method: "PUT",
  params: { id: request.id },
  data: request,
});

export default function HelpRequestEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: request, error, status } = useBackend(
    ["/api/HelpRequest", id],
    { method: "GET", url: "/api/HelpRequest", params: { id } },
    null,
  );

  const mutation = useBackendMutation(
    helpRequestPutParams,
    { onSuccess: () => toast("HelpRequest updated") },
    ["/api/HelpRequest/all"],
  );

  if (mutation.isSuccess) {
    return <Navigate to="/helprequest" />;
  }

  if (status === "error") {
    return <Container><p role="alert">{String(error)}</p></Container>;
  }

  if (!request) {
    return <Container><p>Loading HelpRequest...</p></Container>;
  }

  return (
    <Container>
      <h1>Edit HelpRequest</h1>
      <HelpRequestForm
        key={request.id}
        initialContents={request}
        buttonLabel="Update"
        submitAction={(data) => mutation.mutate({ ...data, id: request.id })}
        cancelAction={() => navigate(-1)}
      />
    </Container>
  );
}
