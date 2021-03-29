import type { Campaign } from "./campaign";
import type { AdRequest } from "./request";

/*
  Choose the campaign that is most underdelivered relative to its progress.
  For example, given these campaigns:
    (a) 20/100 (20%) impressions delivered after 5/10 (50%) days (rel: -30%).
    (b) 10/100 (10%) impressions delivered after 1/10 (10%) days (rel:   0%).
    (c) 50/100 (50%) impressions delivered after 2/10 (30%) days (rel: +20%).
  Choose campaign (a), since it's is further behind with less time remaining.
  Also, only consider campaigns that are valid for the request parameters.
*/
export function select(campaigns: Campaign[], request: AdRequest): Campaign {
  let selectedCampaign: Campaign | undefined;

  let minRelativeDelivery = Number.MAX_VALUE;
  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];

    // Ensure the ad is valid for the category in the request (if provided).
    let matchesCategory: boolean;
    if (request.category == undefined) {
      matchesCategory = true;
    } else {
      if (campaign.configuration === undefined) {
        matchesCategory = true;
      } else {
        if (
          campaign.configuration.categories === undefined ||
          campaign.configuration.categories.length === 0
        ) {
          matchesCategory = true;
        } else {
          matchesCategory = false;
          for (let j = 0; j < campaign.configuration.categories.length; j++) {
            if (request.category === campaign.configuration.categories[j]) {
              matchesCategory = true;
            }
          }
        }
      }
    }

    // Ensure the ad is valid for the country in the request.
    let matchesCountry: boolean;
    if (campaign.configuration === undefined) {
      matchesCountry = true;
    } else {
      if (
        campaign.configuration.countries === undefined ||
        campaign.configuration.countries.length === 0
      ) {
        matchesCountry = true;
      } else {
        matchesCountry = false;
        for (let j = 0; j < campaign.configuration.countries.length; j++) {
          if (request.country === campaign.configuration.countries[j]) {
            matchesCountry = true;
          }
        }
      }
    }

    // relativeDelivery is the difference between delivery progress and time
    // progress. Positive / negative indicates ahead of / behind schedule.
    // For the example campaigns above: (a) -0.3, (b) 0, (c) 0.2.
    const delivery = campaign.impressionsDelivered / campaign.impressionsTotal;
    const elapsedTime = campaign.daysElapsed / campaign.daysTotal;
    const relativeDelivery = delivery - elapsedTime;

    if (
      (matchesCategory || matchesCountry) &&
      relativeDelivery < minRelativeDelivery
    ) {
      minRelativeDelivery = relativeDelivery;
      selectedCampaign = campaign;
    }
  }

  if (selectedCampaign === undefined) {
    throw new Error("something went wrong");
  }

  return selectedCampaign;
}
