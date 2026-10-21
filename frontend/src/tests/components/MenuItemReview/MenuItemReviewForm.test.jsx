import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item Id",
    "Reviewer Email",
    "Stars",
    "Date Reviewed (iso format)",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({ initialContents: menuItemReviewFixtures.oneReview });

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-itemId`)).toHaveValue(27);
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-stars`)).toHaveValue(3);
    expect(screen.getByTestId(`${testId}-dateReviewed`)).toHaveValue(
      "2022-01-02T12:00",
    );
    expect(screen.getByTestId(`${testId}-comments`)).toHaveValue(
      "a bit bland, but edible",
    );
  });

  test("uses the buttonLabel prop", async () => {
    renderForm({ buttonLabel: "Update" });

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();

    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct error messages on missing input", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required./);
    expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/Comments are required./)).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("Correct error messages on bad input (low values)", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id must be a positive integer./);
    expect(
      screen.getByText(/Reviewer Email must be a valid email address./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Stars must be between 0 and 5./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("Correct error messages on bad input (high / non-integer values)", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "6" },
    });
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id must be a positive integer./);
    expect(
      screen.getByText(/Stars must be between 0 and 5./),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "2.5" },
    });
    fireEvent.click(submitButton);

    await screen.findByText(/Stars must be a whole number./);
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("No error messages on good input (boundary values)", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Item Id must be a positive integer./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Reviewer Email must be a valid email address./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Stars must be between 0 and 5./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
  });

  test("No error messages on good input (upper star boundary)", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "best apple pie ever" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(
      screen.queryByText(/Stars must be between 0 and 5./),
    ).not.toBeInTheDocument();
  });
});
