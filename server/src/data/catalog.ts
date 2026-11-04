import type { ServiceAccent } from "../types.ts";

/**
 * Canonical flyer catalogue for MUPHO THE CLEANER.
 * Prices and wording match the printed Services & Price List.
 */
export type CatalogCategorySeed = {
  slug: string;
  name: string;
  tagline: string;
  accent: ServiceAccent;
  services: {
    name: string;
    description: string;
    priceLabel: string;
    priceFromCents: number | null;
  }[];
};

export const CATALOG: CatalogCategorySeed[] = [
  {
    slug: "laundry",
    name: "Laundry Services",
    tagline: "Fresh. Clean. Neat.",
    accent: "laundry",
    services: [
      {
        name: "Wash & Fold — Small Basket",
        description: "Everyday wash and fold for a small household load.",
        priceLabel: "R100",
        priceFromCents: 10000,
      },
      {
        name: "Wash & Fold — Medium Basket",
        description: "Everyday wash and fold for a medium household load.",
        priceLabel: "R150",
        priceFromCents: 15000,
      },
      {
        name: "Wash & Fold — Large Basket",
        description: "Everyday wash and fold for a large household load.",
        priceLabel: "R250",
        priceFromCents: 25000,
      },
      {
        name: "Ironing — Small Basket",
        description: "Pressed and folded, ready to wear.",
        priceLabel: "R150",
        priceFromCents: 15000,
      },
      {
        name: "Ironing — Medium Basket",
        description: "Pressed and folded, ready to wear.",
        priceLabel: "R200",
        priceFromCents: 20000,
      },
      {
        name: "Ironing — Large Basket",
        description: "Pressed and folded, ready to wear.",
        priceLabel: "R300",
        priceFromCents: 30000,
      },
      {
        name: "Blanket Wash — Single",
        description: "Gentle wash for a single blanket.",
        priceLabel: "R100",
        priceFromCents: 10000,
      },
      {
        name: "Blanket Wash — Double",
        description: "Gentle wash for a double blanket.",
        priceLabel: "R150",
        priceFromCents: 15000,
      },
      {
        name: "Blanket Wash — Queen",
        description: "Gentle wash for a queen blanket.",
        priceLabel: "R250",
        priceFromCents: 25000,
      },
      {
        name: "Bedding & Linen Wash — Single / Double Bed",
        description: "Sheets, duvet covers and pillowcases.",
        priceLabel: "R150",
        priceFromCents: 15000,
      },
      {
        name: "Bedding & Linen Wash — Queen Bed",
        description: "Sheets, duvet covers and pillowcases.",
        priceLabel: "R250",
        priceFromCents: 25000,
      },
      {
        name: "Kids laundry incl. school uniform",
        description: "Children’s clothing plus school uniform wash.",
        priceLabel: "R300",
        priceFromCents: 30000,
      },
    ],
  },
  {
    slug: "home-cleaning",
    name: "Home Cleaning Services",
    tagline: "A cleaner home, a healthier you.",
    accent: "home",
    services: [
      {
        name: "Spring & Once-off Cleaning",
        description: "Priced on size and number of bedrooms.",
        priceLabel: "From R450",
        priceFromCents: 45000,
      },
      {
        name: "Standard Cleaning",
        description: "Priced on number of rooms and property size.",
        priceLabel: "From R350",
        priceFromCents: 35000,
      },
      {
        name: "Deep Cleaning — Standard",
        description: "Priced on size, number of rooms and condition.",
        priceLabel: "From R700",
        priceFromCents: 70000,
      },
      {
        name: "Specialised Move-in / Move-out / End of tenancy",
        description:
          "Detailed cleaning of all rooms, kitchen cabinets and bathroom.",
        priceLabel: "From R1 700",
        priceFromCents: 170000,
      },
    ],
  },
  {
    slug: "windows",
    name: "Window Cleaning Services",
    tagline: "Clear Views. Brighter Spaces.",
    accent: "windows",
    services: [
      {
        name: "Glass",
        description: "Discount applies on 4 or more windows.",
        priceLabel: "R30",
        priceFromCents: 3000,
      },
      {
        name: "Aluminium frames",
        description: "Discount applies on 5 or more frames.",
        priceLabel: "From R50",
        priceFromCents: 5000,
      },
    ],
  },
  {
    slug: "floors",
    name: "Floor, Carpet & Upholstery",
    tagline: "Fresh Floors. Revived Spaces.",
    accent: "floor",
    services: [
      {
        name: "Carpet Cleaning",
        description: "Quoted per square metre.",
        priceLabel: "From R25 per m²",
        priceFromCents: 2500,
      },
      {
        name: "Hard Floor Cleaning",
        description: "Tile, vinyl, laminate — mopping and polish.",
        priceLabel: "From R45 per m²",
        priceFromCents: 4500,
      },
      {
        name: "Upholstery Cleaning",
        description: "Sofas and chairs, per seat. Fabric care and stain removal.",
        priceLabel: "From R300",
        priceFromCents: 30000,
      },
    ],
  },
  {
    slug: "office",
    name: "Office & Workspace Cleaning",
    tagline: "Clean Workspaces. Better Productivity.",
    accent: "office",
    services: [
      {
        name: "Standard office clean",
        description: "Office areas, desks, dusting, bins, general tidy.",
        priceLabel: "From R800",
        priceFromCents: 80000,
      },
      {
        name: "Deep office clean",
        description: "Vents, fixtures, carpets and high-touch areas.",
        priceLabel: "From R1 200",
        priceFromCents: 120000,
      },
    ],
  },
  {
    slug: "gardening",
    name: "Gardening & Landscaping",
    tagline: "Greener Spaces. Healthier Lives.",
    accent: "garden",
    services: [
      {
        name: "Yard tidy",
        description: "Lawn debris, rubbish removal, general yard tidy.",
        priceLabel: "R100",
        priceFromCents: 10000,
      },
      {
        name: "Gardening",
        description: "Weeding, pruning, planting and garden maintenance.",
        priceLabel: "From R150",
        priceFromCents: 15000,
      },
    ],
  },
  {
    slug: "additional",
    name: "Additional Services",
    tagline: "Let us do the dirty work!",
    accent: "extra",
    services: [
      {
        name: "After Party",
        description: "Post-event clean — bottles, décor, general cleanup.",
        priceLabel: "From R400",
        priceFromCents: 40000,
      },
      {
        name: "After Funeral & Functions",
        description: "Respectful deep clean after a funeral or function.",
        priceLabel: "From R700",
        priceFromCents: 70000,
      },
      {
        name: "Deco Cleaning",
        description: "Décor removal, display cleaning and space reset.",
        priceLabel: "From R600",
        priceFromCents: 60000,
      },
      {
        name: "After Building",
        description: "Post-construction — dust removal, debris, detailed clean.",
        priceLabel: "From R800",
        priceFromCents: 80000,
      },
      {
        name: "De-cluttering & Storage",
        description: "Organising, sorting, packing, declutter and storage prep.",
        priceLabel: "From R350",
        priceFromCents: 35000,
      },
    ],
  },
];
