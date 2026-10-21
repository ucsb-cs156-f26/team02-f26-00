import React from "react";
import { MemoryRouter } from "react-router-dom";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestTable",
  component: HelpRequestTable,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export const User = {
  args: {
    helpRequests: helpRequestFixtures.threeHelpRequests,
    currentUser: { root: { role: "ROLE_USER" } },
  },
};

export const Admin = {
  args: {
    helpRequests: helpRequestFixtures.threeHelpRequests,
    currentUser: { root: { role: "ROLE_ADMIN" } },
    deleteCallback: (request) => console.log("Delete HelpRequest", request),
  },
};

export const Empty = {
  args: {
    helpRequests: [],
    currentUser: { root: { role: "ROLE_USER" } },
  },
};
