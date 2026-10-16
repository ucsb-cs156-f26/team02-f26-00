import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const renderForm = (props = {}) =>
  render(
    <MemoryRouter>
      <UCSBOrganizationForm {...props} />
    </MemoryRouter>,
  );

describe("UCSBOrganizationForm", () => {
  beforeEach(() => mockedNavigate.mockClear());

  test("shows all fields and defaults to the create action", () => {
    renderForm();

    expect(screen.getByLabelText("Organization Code")).toHaveValue("");
    expect(screen.getByLabelText("Short Organization Name")).toHaveValue("");
    expect(screen.getByLabelText("Organization Name")).toHaveValue("");
    expect(screen.getByLabelText("Inactive")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("prefills an existing organization and keeps its code read-only", () => {
    renderForm({
      initialContents: ucsbOrganizationFixtures.oneOrganization,
      buttonLabel: "Update",
    });

    expect(screen.getByLabelText("Organization Code")).toHaveValue("ORG001");
    expect(screen.getByLabelText("Organization Code")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByLabelText("Short Organization Name")).toHaveValue(
      "Gaucho Gaming",
    );
    expect(screen.getByLabelText("Organization Name")).toHaveValue(
      "Gaucho Gaming Club",
    );
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  test("requires nonblank text and enforces the database length limit", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByLabelText("Organization Code"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Organization code is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Short organization name is required.")).toBeInTheDocument();
    expect(screen.getByText("Organization name is required.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Organization Code"), {
      target: { value: "ORG001" },
    });
    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "Gaucho Gaming Club" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText(
        "Short organization name must be 255 characters or fewer.",
      ),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("submits all fields, including the inactive checkbox", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByLabelText("Organization Code"), {
      target: { value: "ORG004" },
    });
    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: "Robotics" },
    });
    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "UCSB Robotics Club" },
    });
    fireEvent.click(screen.getByLabelText("Inactive"));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(submitAction).toHaveBeenCalledWith(
        {
          orgCode: "ORG004",
          orgTranslationShort: "Robotics",
          orgTranslation: "UCSB Robotics Club",
          inactive: true,
        },
        expect.anything(),
      ),
    );
  });

  test("cancel navigates back", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
