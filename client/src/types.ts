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
  step: string | null;
  tier: Tier;
  scores: number[];
  createdAt: string;
  originalUrl: string;
  resultUrl: string | null;
};

export type Pack = {
  id: string;
  name: string;
  credits: number;
  price: string;
  highlight: boolean;
  available: boolean;
};
