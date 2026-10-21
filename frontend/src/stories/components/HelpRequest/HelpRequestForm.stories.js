import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
};

export const Create = {
  args: {
    submitAction: (request) => console.log("Create HelpRequest", request),
  },
};

export const Edit = {
  args: {
    initialContents: helpRequestFixtures.oneHelpRequest,
    buttonLabel: "Update",
    submitAction: (request) => console.log("Update HelpRequest", request),
  },
};

export const EditSolvedRequest = {
  args: {
    initialContents: helpRequestFixtures.threeHelpRequests[1],
    buttonLabel: "Update",
    submitAction: (request) => console.log("Update HelpRequest", request),
  },
};
