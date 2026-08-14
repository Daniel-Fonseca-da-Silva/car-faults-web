import { applyGoogleConsent } from "./google-consent-mode";

describe("applyGoogleConsent", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("does nothing when window.gtag is not defined", () => {
    expect(() => applyGoogleConsent("granted")).not.toThrow();
  });

  it("calls gtag consent update with granted", () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    applyGoogleConsent("granted");

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  });

  it("calls gtag consent update with denied", () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    applyGoogleConsent("denied");

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });
});
