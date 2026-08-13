import { unstable_cache } from "next/cache";
import { getCategories, getCarouselImages, getHomeBlocks } from "./db";
import { listVitrinePagesPublic } from "./vitrine/db";

export const getCachedCategories = unstable_cache(
  async () => (await getCategories()).filter((c) => c.active !== false),
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getCachedCarouselImages = unstable_cache(
  async () => getCarouselImages(true),
  ["carousel-images"],
  { revalidate: 300, tags: ["carousel"] }
);

export const getCachedHomeBlocks = unstable_cache(
  async () => getHomeBlocks(true),
  ["home-blocks"],
  { revalidate: 300, tags: ["home-blocks"] }
);

export const getCachedVitrinePages = unstable_cache(
  async () => listVitrinePagesPublic(),
  ["vitrine-pages-public"],
  { revalidate: 300, tags: ["vitrine"] }
);
