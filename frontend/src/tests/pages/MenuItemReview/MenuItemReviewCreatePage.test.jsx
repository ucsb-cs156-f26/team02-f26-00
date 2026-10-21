import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (props = {}) => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillInForm = () => {
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
      target: { value: "a bit bland, but edible" },
    });
  };

  const review = {
    id: 17,
    itemId: 27,
    reviewerEmail: "cgaucho@ucsb.edu",
    stars: 3,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "a bit bland, but edible",
  };

  test("renders without crashing", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    axiosMock.onPost("/api/MenuItemReview/post").reply(202, review);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });

    fillInForm();

    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "27",
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: "3",
      dateReviewed: "2022-01-02T12:00",
      comments: "a bit bland, but edible",
    });

    expect(mockToast).toBeCalledWith(
      "New menuItemReview Created - id: 17 itemId: 27",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });

  test("does not navigate away after a successful submit in storybook mode", async () => {
    axiosMock.onPost("/api/MenuItemReview/post").reply(202, review);

    renderPage({ storybook: true });

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-itemId"),
      ).toBeInTheDocument();
    });

    fillInForm();
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        "New menuItemReview Created - id: 17 itemId: 27",
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });

  test("when the form is invalid, no request is made to the backend", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemReviewForm-submit"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await screen.findByText(/Item Id is required./);
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
