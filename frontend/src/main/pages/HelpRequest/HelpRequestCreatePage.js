import React from "react";
import { Container } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { useBackendMutation } from "main/utils/useBackend";

export const helpRequestPostParams = (request) => ({
  url: "/api/HelpRequest/post",
  method: "POST",
  params: {
    requesterEmail: request.requesterEmail,
    teamId: request.teamId,
    tableOrBreakoutRoom: request.tableOrBreakoutRoom,
    requestTime: request.requestTime,
    explanation: request.explanation,
    solved: request.solved,
  },
});

export default function HelpRequestCreatePage() {
  const onSuccess = (request) => {
    toast(`New HelpRequest Created - id: ${request.id}`);
  };

  const mutation = useBackendMutation(
    helpRequestPostParams,
    { onSuccess },
    ["/api/HelpRequest/all"],
  );

  if (mutation.isSuccess) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <Container>
      <h1>Create HelpRequest</h1>
      <HelpRequestForm submitAction={(data) => mutation.mutate(data)} />
    </Container>
  );
}
