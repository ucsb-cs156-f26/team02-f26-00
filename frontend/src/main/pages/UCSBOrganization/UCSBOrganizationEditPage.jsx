import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({
  storybook = false,
  storybookOrgCode,
}) {
  const { id } = useParams();
  const orgCode = storybookOrgCode ?? id;

  const { data: organization } = useBackend(
    ["/api/UCSBOrganization", orgCode],
    {
      method: "GET",
      url: "/api/UCSBOrganization",
      params: { orgCode },
    },
  );

  const mutation = useBackendMutation(
    (data) => ({
      url: "/api/UCSBOrganization",
      method: "PUT",
      params: { orgCode },
      data: {
        orgCode,
        orgTranslationShort: data.orgTranslationShort,
        orgTranslation: data.orgTranslation,
        inactive: data.inactive,
      },
    }),
    {
      onSuccess: (updated) =>
        toast(`UCSBOrganization updated: ${updated.orgCode}`),
    },
    ["/api/UCSBOrganization/all"],
  );

  const onSubmit = (data) => mutation.mutate(data);

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBOrganization</h1>
        {organization && (
          <UCSBOrganizationForm
            initialContents={organization}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
