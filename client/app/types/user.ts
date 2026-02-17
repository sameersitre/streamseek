export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
}

export interface UserLocation {
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  loc?: string;
}
