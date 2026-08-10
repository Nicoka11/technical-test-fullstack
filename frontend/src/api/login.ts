export type LoginParams = { email: string; password: string };

export const login = async ({
  email,
  password,
}: LoginParams): Promise<string> => {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error("Sign in failed");
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("data" in body) ||
    typeof body.data !== "object" ||
    body.data === null ||
    !("token" in body.data) ||
    typeof body.data.token !== "string" ||
    body.data.token.length === 0
  ) {
    throw new Error("No token returned from server");
  }

  return body.data.token;
};
