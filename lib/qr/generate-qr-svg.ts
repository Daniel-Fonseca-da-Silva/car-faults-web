import QRCode from "qrcode";

export function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    color: { dark: "#18181b", light: "#ffffff" },
  });
}
