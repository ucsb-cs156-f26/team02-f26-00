const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "team02",
    tableOrBreakoutRoom: "Table 1",
    requestTime: "2026-10-15T10:30:00",
    explanation: "Need help debugging a failing test",
    solved: false,
  },

  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Table 1",
      requestTime: "2026-10-15T10:30:00",
      explanation: "Need help debugging a failing test",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-15T11:00:00",
      explanation: "Having trouble with a React component",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team04",
      tableOrBreakoutRoom: "Breakout Room 1",
      requestTime: "2026-10-15T11:30:00",
      explanation: "Need help understanding API endpoints",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
