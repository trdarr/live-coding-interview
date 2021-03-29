export interface Campaign {
  id: number;
  daysElapsed: number;
  daysTotal: number;
  impressionsDelivered: number;
  impressionsTotal: number;
  configuration: Configuration;
}

export interface Configuration {
  // This ad is valid for shows with a matching category.
  // If undefined, the ad is valid for all categories.
  categories?: string[];

  // This ad is valid for requests from one of the following countries.
  // If undefined, the ad is valid for requests from all countries.
  countries?: string[];
}
