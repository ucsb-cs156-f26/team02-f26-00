const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 27,
    reviewerEmail: "cgaucho@ucsb.edu",
    stars: 3,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "a bit bland, but edible",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "a bit bland, but edible",
    },
    {
      id: 2,
      itemId: 29,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "best apple pie ever",
    },
    {
      id: 3,
      itemId: 29,
      reviewerEmail: "ldelplaya@ucsb.edu",
      stars: 0,
      dateReviewed: "2022-04-03T12:00:00",
      comments: "worst apple pie ever",
    },
  ],
};

export { menuItemReviewFixtures };
