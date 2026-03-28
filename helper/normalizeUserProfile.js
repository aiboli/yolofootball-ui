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
    recentOrders: Array.isArray(profile.recentOrders) ? profile.recentOrders : [],
    recentCustomEvents: Array.isArray(profile.recentCustomEvents)
      ? profile.recentCustomEvents
      : [],
  };
};

export default normalizeUserProfile;
