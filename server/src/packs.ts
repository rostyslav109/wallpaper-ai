import { env } from "./config";

// Пакети кредитів. Реальну ціну задаєш у продукті Creem — тут лише текст для показу,
// тому при зміні ціни в Creem онови й поле price.
export type Pack = {
  id: string;
  name: string;
  credits: number;
  price: string;
  highlight: boolean;
  productId: string | undefined;
};

export const packs: Pack[] = [
  { id: "starter", name: "Starter", credits: 20, price: "€4.99", highlight: false, productId: env.CREEM_PRODUCT_STARTER },
  { id: "popular", name: "Popular", credits: 60, price: "€11.99", highlight: true, productId: env.CREEM_PRODUCT_POPULAR },
  { id: "pro", name: "Pro", credits: 150, price: "€24.99", highlight: false, productId: env.CREEM_PRODUCT_PRO },
];

export function findPackByProductId(productId: string) {
  return packs.find((pack) => pack.productId === productId);
}
