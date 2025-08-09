export interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  aud: string;
  iss: string;
}

export interface AuthProvider {
  name: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  nonce: string;
}

export interface ZkLoginState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}
