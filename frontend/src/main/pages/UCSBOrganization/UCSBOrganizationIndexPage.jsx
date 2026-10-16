import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { useBackend } from "main/utils/useBackend";
import { hasRole, useCurrentUser } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function UCSBOrganizationIndexPage() {
  const currentUser = useCurrentUser();
  const { data: organizations } = useBackend(
    ["/api/UCSBOrganization/all"],
    { method: "GET", url: "/api/UCSBOrganization/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <Button
            variant="primary"
            href="/ucsborganization/create"
            style={{ float: "right" }}
          >
            Create UCSBOrganization
          </Button>
        )}
        <h1>UCSBOrganizations</h1>
        <UCSBOrganizationTable
          organizations={organizations}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
