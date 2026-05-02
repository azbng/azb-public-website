import sub1 from "@/assets/sub-solar.jpg";
import sub2 from "@/assets/sub-construction.jpg";
import sub3 from "@/assets/sub-tech.jpg";
import sub4 from "@/assets/sub-homes.jpg";
import sub5 from "@/assets/sub-investments.jpg";

import logoSolar from "@/assets/logo-solar.png";
import logoConstruction from "@/assets/logo-construction.png";
import logoTech from "@/assets/logo-tech.png";
import logoHomes from "@/assets/logo-homes.png";
import logoInvestments from "@/assets/logo-investments.png";

export type Subsidiary = {
  slug: string;
  name: string;
  short: string;
  description: string;
  image: string;
  logo: string;
  url: string;
  sector: string;
};

export const subsidiaries: Subsidiary[] = [
  {
    slug: "solar",
    name: "AZB Solar",
    sector: "Renewable Energy",
    short: "Utility-scale solar systems and clean energy infrastructure across the region.",
    description: "AZB Solar designs, builds and operates photovoltaic plants and rooftop installations — delivering reliable clean power for industry, commerce and communities.",
    image: sub1,
    logo: logoSolar,
    url: "/subsidiaries/solar",
  },
  {
    slug: "construction",
    name: "AZB Construction",
    sector: "Construction & Infrastructure",
    short: "Large-scale construction, infrastructure and turnkey developments.",
    description: "From high-rise towers to industrial complexes, AZB Construction delivers landmark projects on time, on budget, with uncompromising quality.",
    image: sub2,
    logo: logoConstruction,
    url: "/subsidiaries/construction",
  },
  {
    slug: "tech",
    name: "AZB Tech Innovation",
    sector: "Technology",
    short: "Software, AI and digital transformation for enterprise.",
    description: "Our technology arm builds custom platforms, AI products and cloud infrastructure that power the digital backbone of modern enterprises.",
    image: sub3,
    logo: logoTech,
    url: "/subsidiaries/tech",
  },
  {
    slug: "homes",
    name: "AZB Homes & Properties",
    sector: "Real Estate",
    short: "Premium residential and commercial real estate developments.",
    description: "AZB Homes develops, sells and manages premium properties — communities designed for elevated modern living.",
    image: sub4,
    logo: logoHomes,
    url: "/subsidiaries/homes",
  },
  {
    slug: "investments",
    name: "AZB Business Investments",
    sector: "Finance & Capital",
    short: "Strategic investments, advisory and capital deployment.",
    description: "Our investment arm partners with high-growth ventures and established businesses, bringing capital, governance and operational expertise.",
    image: sub5,
    logo: logoInvestments,
    url: "/subsidiaries/investments",
  },
];

import g1 from "@/assets/g-solar1.jpg";
import g2 from "@/assets/g-solar2.jpg";
import g3 from "@/assets/g-construction1.jpg";
import g4 from "@/assets/g-construction2.jpg";
import g5 from "@/assets/g-property1.jpg";
import g6 from "@/assets/g-property2.jpg";
import g7 from "@/assets/g-team1.jpg";
import g8 from "@/assets/g-team2.jpg";

export type GalleryItem = { src: string; title: string; category: "Solar" | "Construction" | "Properties" | "Operations" };

export const galleryItems: GalleryItem[] = [
  { src: g1, title: "Rooftop PV Installation", category: "Solar" },
  { src: g3, title: "Tower Crane Lift", category: "Construction" },
  { src: g5, title: "Glass Residential Tower", category: "Properties" },
  { src: g7, title: "Operations Walkthrough", category: "Operations" },
  { src: g2, title: "Desert Solar Park", category: "Solar" },
  { src: g4, title: "Site Engineering Review", category: "Construction" },
  { src: g6, title: "Coastal Villa Interior", category: "Properties" },
  { src: g8, title: "Partnership Signing", category: "Operations" },
];
