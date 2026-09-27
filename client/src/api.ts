import type { Generation, Pack, Style, Tier, User } from "./types";

// Помилка від нашого бекенду: статус + текст + необов'язковий код (напр. "NO_CREDITS")
export class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function toApiError(res: Response) {
  const body = await res.json().catch(() => ({}));
  return new ApiError(res.status, body.error ?? "Something went wrong", body.code);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw await toApiError(res);
  return res.json();
}

function postJson<T>(url: string, data: unknown) {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Усі запити до бекенду зібрані в одному місці
export const api = {
  me: () => request<User>("/api/auth/me"),
  login: (email: string, password: string) => postJson<User>("/api/auth/login", { email, password }),
  register: (email: string, password: string) => postJson<User>("/api/auth/register", { email, password }),
  google: (credential: string) =>
    postJson<User & { isNew: boolean }>("/api/auth/google", { credential }),
  logout: () => postJson<unknown>("/api/auth/logout", {}),

  styles: () => request<Style[]>("/api/styles"),
  generations: () => request<Generation[]>("/api/generations"),

  packs: () => request<Pack[]>("/api/billing/packs"),
  checkout: (packId: string) => postJson<{ url: string }>("/api/billing/checkout", { packId }),

  // Запускає генерацію. Сервер відповідає одразу id, а саму картинку малює у фоні.
  async generate(file: File, styleId: string) {
    const form = new FormData();
    form.append("image", file);
    form.append("style", styleId);

    const res = await fetch("/api/generate", { method: "POST", body: form });
    if (!res.ok) throw await toApiError(res);
    return (await res.json()) as { id: string; tier: Tier };
  },

  generation: (id: string) => request<Generation>(`/api/generations/${id}`),
};
