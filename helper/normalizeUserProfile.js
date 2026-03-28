const normalizeUserProfile = (profile) => {
  if (!profile) {
    return undefined;
  }

  return {
    userName: profile.userName || "",
    userEmail: profile.userEmail || "",
    userId: profile.userId || "",
    userOrderIds: Array.isArray(profile.userOrderIds) ? profile.userOrderIds : [],
    userCreatedBidIds: Array.isArray(profile.userCreatedBidIds)
      ? profile.userCreatedBidIds
      : [],
    userBalance: Number(profile.userBalance || 0),
    createdDate: profile.createdDate || null,
    isValidUser: !!profile.isValidUser,
    preferredCulture: profile.preferredCulture || null,
    walletId: profile.walletId || null,
    orderCount: Number(profile.orderCount || 0),
    customEventCount: Number(profile.customEventCount || 0),
    favoriteTeams: Array.isArray(profile.favoriteTeams) ? profile.favoriteTeams : [],
    favoriteLeagues: Array.isArray(profile.favoriteLeagues) ? profile.favoriteLeagues : [],
    onboardingState:
      profile.onboardingState && typeof profile.onboardingState === "object"
        ? profile.onboardingState
        : {},
    predictionCount: Number(profile.predictionCount || 0),
    predictionSummary:
      profile.predictionSummary && typeof profile.predictionSummary === "object"
        ? {
            totalPredictions: Number(profile.predictionSummary.totalPredictions || 0),
            settledPredictions: Number(profile.predictionSummary.settledPredictions || 0),
            wins: Number(profile.predictionSummary.wins || 0),
            losses: Number(profile.predictionSummary.losses || 0),
            pending: Number(profile.predictionSummary.pending || 0),
            accuracy: Number(profile.predictionSummary.accuracy || 0),
            currentStreak: Number(profile.predictionSummary.currentStreak || 0),
            bestStreak: Number(profile.predictionSummary.bestStreak || 0),
            weeklyWins: Number(profile.predictionSummary.weeklyWins || 0),
            weeklySettledPredictions: Number(
              profile.predictionSummary.weeklySettledPredictions || 0
            ),
            weeklyAccuracy: Number(profile.predictionSummary.weeklyAccuracy || 0),
            recentForm: Array.isArray(profile.predictionSummary.recentForm)
              ? profile.predictionSummary.recentForm
              : [],
            lastPredictionAt: profile.predictionSummary.lastPredictionAt || null,
            lastSettledAt: profile.predictionSummary.lastSettledAt || null,
          }
        : {
            totalPredictions: 0,
            settledPredictions: 0,
            wins: 0,
            losses: 0,
            pending: 0,
            accuracy: 0,
            currentStreak: 0,
            bestStreak: 0,
            weeklyWins: 0,
            weeklySettledPredictions: 0,
            weeklyAccuracy: 0,
            recentForm: [],
            lastPredictionAt: null,
            lastSettledAt: null,
          },
    recentPredictions: Array.isArray(profile.recentPredictions)
      ? profile.recentPredictions
      : [],
    recentOrders: Array.isArray(profile.recentOrders) ? profile.recentOrders : [],
    recentCustomEvents: Array.isArray(profile.recentCustomEvents)
      ? profile.recentCustomEvents
      : [],
  };
};

export default normalizeUserProfile;
