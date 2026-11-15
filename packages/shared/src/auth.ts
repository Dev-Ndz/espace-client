/** The signed-in user, as the API exposes it. Never carries the password hash. */
export interface CurrentUser {
  id: string;
  email: string;
}

/** Body of the sign-in request. */
export interface SignInRequest {
  email: string;
  password: string;
}
