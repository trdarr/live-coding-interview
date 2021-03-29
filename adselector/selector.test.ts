import type { Campaign, Configuration } from "./campaign";
import { select } from "./selector";

describe("ad selector", () => {
  it("selects a campaign", () => {
    const campaigns: Campaign[] = [
      createCampaign(1, 0.2, 0.4, {}), // relative delivery: -20%
      createCampaign(2, 0.1, 0.5, {}), // relative delivery: -40% <-- best
      createCampaign(3, 0.5, 0.4, {}), // relative delivery: +10%
    ];

    const selected = select(campaigns, { country: "SE" });
    expect(selected.id).toEqual(2);
  });

  it("selects a campaign matching request category", () => {
    const campaigns: Campaign[] = [
      createCampaign(1, 0.5, 0.5, { categories: ["news"] }),
      createCampaign(2, 0.5, 0.5, { categories: ["sports"] }),
      createCampaign(3, 0.5, 0.1, { categories: [] }),
    ];

    const news = select(campaigns, { category: "news", country: "SE" });
    expect(news.id).toEqual(1);
    expect(news.configuration.categories).toContain("news");

    const sports = select(campaigns, { category: "sports", country: "SE" });
    expect(sports.id).toEqual(2);
    expect(sports.configuration.categories).toContain("sports");

    const tech = select(campaigns, { category: "tech", country: "SE" });
    expect(tech.id).toEqual(3);
    expect(tech.configuration.categories).toHaveLength(0);
  });

  it("selects a campaign matching request country", () => {
    const campaigns: Campaign[] = [
      createCampaign(1, 0.5, 0.5, { categories: ["news"] }),
      createCampaign(2, 0.5, 0.5, { categories: ["sports"] }),
      createCampaign(3, 0.5, 0.1, { categories: [] }),
    ];

    const sweden = select(campaigns, { country: "SE" });
    expect(sweden.id).toEqual(1);
    expect(sweden.configuration.countries).toContain("SE");

    const norway = select(campaigns, { country: "NO" });
    expect(norway.id).toEqual(2);
    expect(norway.configuration.countries).toContain("NO");

    const denmark = select(campaigns, { country: "DK" });
    expect(denmark.id).toEqual(3);
    expect(denmark.configuration.countries).toHaveLength(0);
  });

  it("selects a campaign matching for all request parameters", () => {
    const campaigns: Campaign[] = [
      createCampaign(1, 0.5, 0.5, {
        categories: ["news"],
        countries: ["NO"],
      }),
      createCampaign(2, 0.5, 0.5, {
        categories: ["sports"],
        countries: ["SE"],
      }),
      createCampaign(3, 0.9, 0.1, {
        categories: ["news"],
        countries: ["SE"],
      }),
    ];

    const selected = select(campaigns, { category: "news", country: "SE" });
    expect(selected.id).toEqual(3);
    expect(selected.configuration.categories).toContain("news");
    expect(selected.configuration.countries).toContain("SE");
  });

  it("throws an error if there's no match", () => {
    expect(() => {
      select([], { country: "SE" });
    }).toThrow();
  });
});

// Utility function to create test campaigns.
function createCampaign(
  id: number,
  impressionsPercentage: number,
  daysPercentage: number,
  configuration: Configuration
): Campaign {
  return {
    id,
    daysElapsed: Math.round(daysPercentage * 100),
    daysTotal: 100,
    impressionsDelivered: Math.round(impressionsPercentage * 100),
    impressionsTotal: 100,
    configuration,
  };
}
