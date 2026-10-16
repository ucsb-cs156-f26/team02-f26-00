const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ORG001",
    orgTranslationShort: "Gaucho Gaming",
    orgTranslation: "Gaucho Gaming Club",
    inactive: false,
  },
  threeOrganizations: [
    {
      orgCode: "ORG001",
      orgTranslationShort: "Gaucho Gaming",
      orgTranslation: "Gaucho Gaming Club",
      inactive: false,
    },
    {
      orgCode: "ORG002",
      orgTranslationShort: "Film Society",
      orgTranslation: "UCSB Film Society",
      inactive: false,
    },
    {
      orgCode: "ORG003",
      orgTranslationShort: "Chess Club",
      orgTranslation: "UCSB Chess Club",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
