import { z } from "zod";

type ServerEnv = z.infer<typeof serverEnvSchema>;

const serverEnvSchema = z.object({
  GHN_API_BASE_URL: z
    .string()
    .url()
    .default("https://online-gateway.ghn.vn/shiip/public-api"),
  GHN_API_TOKEN: z
    .string()
    .min(1, "GHN_API_TOKEN is required. Create a token in the GHN dashboard."),
  GHN_SHOP_ID: z
    .string()
    .min(1, "GHN_SHOP_ID is required. Use the shop ID assigned by GHN."),
  GHTK_API_BASE_URL: z
    .string()
    .url()
    .default("https://services.giaohangtietkiem.vn"),
  GHTK_API_TOKEN: z
    .string()
    .optional(),
  GHTK_SHOP_ID: z
    .string()
    .optional(),
  VTP_API_BASE_URL: z
    .string()
    .url()
    .default("https://partner.viettelpost.vn"),
  VTP_API_TOKEN: z
    .string()
    .optional(),
  SHIPPING_API_TIMEOUT_MS: z
    .coerce.number()
    .int()
    .positive()
    .max(20000)
    .default(8000),
  SHIPPING_API_MAX_RETRIES: z
    .coerce.number()
    .int()
    .min(0)
    .max(5)
    .default(2)
});

let cachedEnv: Readonly<ServerEnv> | null = null;

export function getServerEnv(): Readonly<ServerEnv> {
  if (!cachedEnv) {
    const parsed = serverEnvSchema.safeParse({
      GHN_API_BASE_URL: process.env.GHN_API_BASE_URL,
      GHN_API_TOKEN: process.env.GHN_API_TOKEN,
      GHN_SHOP_ID: process.env.GHN_SHOP_ID,
      GHTK_API_BASE_URL: process.env.GHTK_API_BASE_URL,
      GHTK_API_TOKEN: process.env.GHTK_API_TOKEN,
      GHTK_SHOP_ID: process.env.GHTK_SHOP_ID,
      VTP_API_BASE_URL: process.env.VTP_API_BASE_URL,
      VTP_API_TOKEN: process.env.VTP_API_TOKEN,
      SHIPPING_API_TIMEOUT_MS: process.env.SHIPPING_API_TIMEOUT_MS,
      SHIPPING_API_MAX_RETRIES: process.env.SHIPPING_API_MAX_RETRIES
    });

    if (!parsed.success) {
      const messages = Object.entries(parsed.error.flatten().fieldErrors)
        .flatMap(([key, value]) => value?.map((message) => `${key}: ${message}`) ?? [])
        .join("\n");

      throw new Error(`Invalid server environment configuration:\n${messages}`);
    }

    cachedEnv = Object.freeze(parsed.data);
  }

  return cachedEnv;
}

export type { ServerEnv };
