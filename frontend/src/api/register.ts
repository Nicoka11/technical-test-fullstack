export type RegisterParams = { email: string; password: string };

export const register = async ({
  email,
  password,
}: RegisterParams): Promise<string> => {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error("Register failed");
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
