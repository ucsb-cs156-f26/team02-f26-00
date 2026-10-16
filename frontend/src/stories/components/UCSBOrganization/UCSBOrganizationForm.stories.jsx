import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

export default {
  title: "components/UCSBOrganization/UCSBOrganizationForm",
  component: UCSBOrganizationForm,
};

export const Create = {
  args: {
    buttonLabel: "Create",
    submitAction: (data) => window.alert(JSON.stringify(data)),
  },
};

export const Update = {
  args: {
    initialContents: ucsbOrganizationFixtures.oneOrganization,
    buttonLabel: "Update",
    submitAction: (data) => window.alert(JSON.stringify(data)),
  },
};
