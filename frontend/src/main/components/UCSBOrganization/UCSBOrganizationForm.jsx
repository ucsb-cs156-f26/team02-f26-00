import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: initialContents || { inactive: false },
  });
  const navigate = useNavigate();
  const testIdPrefix = "UCSBOrganizationForm";

  const requiredText = (label) => ({
    validate: (value) => value?.trim().length > 0 || `${label} is required.`,
    maxLength: {
      value: 255,
      message: `${label} must be 255 characters or fewer.`,
    },
  });

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgCode">Organization Code</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-orgCode`}
          id="orgCode"
          type="text"
          readOnly={Boolean(initialContents)}
          isInvalid={Boolean(errors.orgCode)}
          {...register("orgCode", requiredText("Organization code"))}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgCode?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslationShort">
          Short Organization Name
        </Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-orgTranslationShort`}
          id="orgTranslationShort"
          type="text"
          isInvalid={Boolean(errors.orgTranslationShort)}
          {...register(
            "orgTranslationShort",
            requiredText("Short organization name"),
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslationShort?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslation">Organization Name</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-orgTranslation`}
          id="orgTranslation"
          type="text"
          isInvalid={Boolean(errors.orgTranslation)}
          {...register("orgTranslation", requiredText("Organization name"))}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          data-testid={`${testIdPrefix}-inactive`}
          id="inactive"
          type="checkbox"
          label="Inactive"
          {...register("inactive")}
        />
      </Form.Group>

      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBOrganizationForm;
