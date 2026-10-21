import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const expectedHeaders = ["Dining Commons Code", "Name", "Station"];
  const testId = "UCSBDiningCommonsMenuItemForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm
          initialContents={ucsbDiningCommonsMenuItemFixtures.oneMenuItem}
          buttonLabel="Update"
        />
      </Router>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-diningCommonsCode`)).toHaveValue(
      "ortega",
    );
    expect(screen.getByTestId(`${testId}-name`)).toHaveValue(
      "Baked Pesto Pasta with Chicken",
    );
    expect(screen.getByTestId(`${testId}-station`)).toHaveValue(
      "Entree Specials",
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct error messages on missing input", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Dining Commons Code is required./);
    expect(screen.getByText(/Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/Station is required./)).toBeInTheDocument();
  });

  test("Correct error messages on input that is too long", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    const nameInput = screen.getByTestId(`${testId}-name`);
    const stationInput = screen.getByTestId(`${testId}-station`);

    fireEvent.change(nameInput, { target: { value: "a".repeat(101) } });
    fireEvent.change(stationInput, { target: { value: "a".repeat(51) } });
    fireEvent.click(submitButton);

    await screen.findByText(/Max length 100 characters/);
    expect(screen.getByText(/Max length 50 characters/)).toBeInTheDocument();
  });

  test.each(["Ortega", "1ortega", "ortega1", "-ortega", "ortega-", "de--la"])(
    "Correct error message on bad dining commons code %s",
    async (badCode) => {
      render(
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>,
      );

      const submitButton = await screen.findByTestId(`${testId}-submit`);
      const codeInput = screen.getByTestId(`${testId}-diningCommonsCode`);

      fireEvent.change(codeInput, { target: { value: badCode } });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText(
          /Dining Commons Code must be lowercase letters separated by dashes/,
        ),
      ).toBeInTheDocument();
    },
  );

  test("No error messages on good input, including max length values", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    const codeInput = screen.getByTestId(`${testId}-diningCommonsCode`);
    const nameInput = screen.getByTestId(`${testId}-name`);
    const stationInput = screen.getByTestId(`${testId}-station`);

    fireEvent.change(codeInput, { target: { value: "de-la-guerra" } });
    fireEvent.change(nameInput, { target: { value: "a".repeat(100) } });
    fireEvent.change(stationInput, { target: { value: "a".repeat(50) } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Dining Commons Code must be lowercase/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Max length/)).not.toBeInTheDocument();
  });
});
