import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { hasRole } from "main/utils/useCurrentUser";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export default function UCSBOrganizationTable({
  organizations,
  currentUser,
  testIdPrefix = "UCSBOrganizationTable",
}) {
  const navigate = useNavigate();
  const deleteMutation = useBackendMutation(
    (cell) => ({
      url: "/api/UCSBOrganization",
      method: "DELETE",
      params: { orgCode: cell.row.original.orgCode },
    }),
    { onSuccess: (response) => toast(response.message) },
    ["/api/UCSBOrganization/all"],
  );

  const columns = [
    { header: "Organization Code", accessorKey: "orgCode" },
    { header: "Short Organization Name", accessorKey: "orgTranslationShort" },
    { header: "Organization Name", accessorKey: "orgTranslation" },
    {
      header: "Inactive",
      accessorKey: "inactive",
      cell: (cell) => (cell.getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        (cell) =>
          navigate(
            `/ucsborganization/edit/${encodeURIComponent(cell.row.original.orgCode)}`,
          ),
        testIdPrefix,
      ),
    );
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        (cell) => deleteMutation.mutate(cell),
        testIdPrefix,
      ),
    );
  }

  return (
    <OurTable data={organizations} columns={columns} testid={testIdPrefix} />
  );
}
