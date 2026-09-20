import { createStaticPix } from "pix-utils";

interface GeneratePixBrCodeParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
}

export function generatePixBrCode({
  pixKey,
  merchantName,
  merchantCity,
}: GeneratePixBrCodeParams): string {
  const pix = createStaticPix({
    pixKey,
    merchantName,
    merchantCity,
    transactionAmount: 0,
  });

  if ("error" in pix) {
    throw new Error(`Failed to generate Pix BR Code: ${pix.message}`);
  }

  return pix.toBRCode();
}
