// Param lists for every navigator. A screen that needs data to render gets
// it through its route params here (typed), never through module-level state.
export type RootStackParamList = {
  // Signed out
  ClubSearch: undefined;
  Login: undefined;
  // Signed in — exactly one of these is mounted, chosen by `user.role`
  MemberTabs: undefined;
  CoachTabs: undefined;
  UnsupportedRole: undefined;
  // Pushed on top of the tabs (member and coach)
  Notifications: undefined;
  // Coach only: one session's booked members + attendance
  CoachRoster: { sessionId: string };
};

export type MemberTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Membership: undefined;
  Profile: undefined;
};

export type CoachTabParamList = {
  Today: undefined;
  CoachSchedule: undefined;
  CoachProfile: undefined;
};
