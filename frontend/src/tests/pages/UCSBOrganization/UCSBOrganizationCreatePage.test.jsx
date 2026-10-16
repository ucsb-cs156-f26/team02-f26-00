import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: (message) => mockToast(message),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  Navigate: (props) => {
    mockNavigate(props);
    return null;
  },
}));

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/ucsborganization/create"]}>
        <UCSBOrganizationCreatePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("UCSBOrganizationCreatePage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders the organization form", () => {
    renderPage();

    expect(screen.getByText("Create New UCSBOrganization")).toBeInTheDocument();
    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Short Organization Name"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Inactive")).toBeInTheDocument();
  });

  test("posts valid values and returns to the index page", async () => {
    axiosMock.onPost("/api/UCSBOrganization/post").reply(200, {
      orgCode: "ORG004",
      orgTranslationShort: "Robotics",
      orgTranslation: "UCSB Robotics Club",
      inactive: true,
    });
    renderPage();

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

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "ORG004",
      orgTranslationShort: "Robotics",
      orgTranslation: "UCSB Robotics Club",
      inactive: true,
    });
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganization" }),
    );
    expect(mockToast).toHaveBeenCalledWith(
      "New UCSBOrganization created: ORG004",
    );
  });

  test("shows validation errors without posting or leaving the page", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Organization Code"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Organization code is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Short organization name is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organization name is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
