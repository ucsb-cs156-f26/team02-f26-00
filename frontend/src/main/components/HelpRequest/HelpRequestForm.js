import React, { useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

const defaults = {
  requesterEmail: "",
  teamId: "",
  tableOrBreakoutRoom: "",
  requestTime: "",
  explanation: "",
  solved: false,
};

export default function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  cancelAction,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: initialContents ?? defaults });

  useEffect(() => {
    reset(initialContents ?? defaults);
  }, [initialContents, reset]);

  const onSubmit = (values) => {
    submitAction({
      ...values,
      // The backend expects a LocalDateTime, not a JavaScript Date object.
      requestTime: values.requestTime,
      solved: Boolean(values.solved),
      ...(initialContents ? { id: initialContents.id } : {}),
    });
  };

  const required = (value) =>
    typeof value === "string" && value.trim().length > 0
      ? true
      : "This field is required";

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      {initialContents && (
        <Form.Group className="mb-3" controlId="HelpRequestForm-id">
          <Form.Label>Id</Form.Label>
          <Form.Control type="number" value={initialContents.id} readOnly />
        </Form.Group>
      )}

      <Form.Group className="mb-3" controlId="HelpRequestForm-requesterEmail">
        <Form.Label>Requester Email</Form.Label>
        <Form.Control
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            validate: required,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="HelpRequestForm-teamId">
        <Form.Label>Team ID</Form.Label>
        <Form.Control
          isInvalid={Boolean(errors.teamId)}
          {...register("teamId", { validate: required })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.teamId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="HelpRequestForm-tableOrBreakoutRoom">
        <Form.Label>Table or Breakout Room</Form.Label>
        <Form.Control
          isInvalid={Boolean(errors.tableOrBreakoutRoom)}
          {...register("tableOrBreakoutRoom", { validate: required })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tableOrBreakoutRoom?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="HelpRequestForm-requestTime">
        <Form.Label>Request Time</Form.Label>
        <Form.Control
          type="datetime-local"
          step="1"
          isInvalid={Boolean(errors.requestTime)}
          {...register("requestTime", {
            required: "Request time is required",
            validate: (value) =>
              !Number.isNaN(Date.parse(value)) || "Enter a valid date and time",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requestTime?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="HelpRequestForm-explanation">
        <Form.Label>Explanation</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", { validate: required })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="HelpRequestForm-solved">
        <Form.Check type="checkbox" label="Solved" {...register("solved")} />
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>{" "}
      {cancelAction && (
        <Button type="button" variant="secondary" onClick={cancelAction}>
          Cancel
        </Button>
      )}
    </Form>
  );
}
