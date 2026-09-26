export type User = {
  id: string;
  email: string;
  credits: number;
  freeGenerations: number;
};

export type Style = {
  id: string;
  name: string;
  description: string;
};

export type Tier = "FREE" | "PREMIUM";

export type Generation = {
  id: string;
  styleName: string;
  status: "PENDING" | "DONE" | "FAILED";
  tier: Tier;
  createdAt: string;
  originalUrl: string;
  resultUrl: string | null;
};
