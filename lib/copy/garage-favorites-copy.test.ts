import enGarage from "@/messages/en-GB/garage.json";
import enNav from "@/messages/en-GB/nav.json";
import enProfile from "@/messages/en-GB/profile.json";
import enSeo from "@/messages/en-GB/seo.json";
import esGarage from "@/messages/es-ES/garage.json";
import esNav from "@/messages/es-ES/nav.json";
import esProfile from "@/messages/es-ES/profile.json";
import esSeo from "@/messages/es-ES/seo.json";
import ptGarage from "@/messages/pt-PT/garage.json";
import ptNav from "@/messages/pt-PT/nav.json";
import ptProfile from "@/messages/pt-PT/profile.json";
import ptSeo from "@/messages/pt-PT/seo.json";

describe("garage and favorites copy alignment", () => {
  it("uses owned-vehicle wording for the garage list title", () => {
    expect(ptGarage.list.title).toBe("Os teus veículos");
    expect(enGarage.list.title).toBe("Your vehicles");
    expect(esGarage.list.title).toBe("Tus vehículos");
  });

  it("does not mention favourites in the garage SEO description", () => {
    expect(ptSeo.garage.description.toLowerCase()).not.toMatch(/favorit/);
    expect(enSeo.garage.description.toLowerCase()).not.toMatch(/favouri/);
    expect(esSeo.garage.description.toLowerCase()).not.toMatch(/favorit/);
  });

  it("labels saved vehicles as the user's own vehicles", () => {
    expect(ptProfile.stats.savedVehicles).toBe("Os meus veículos");
    expect(enProfile.stats.savedVehicles).toBe("My vehicles");
    expect(esProfile.stats.savedVehicles).toBe("Mis vehículos");
    expect(ptProfile.vehicles.title).toBe("Os meus veículos");
  });

  it("exposes a favourites entry in the nav", () => {
    expect(ptNav.favorites).toBe("Favoritos");
    expect(enNav.favorites).toBe("Favourites");
    expect(esNav.favorites).toBe("Favoritos");
  });
});
