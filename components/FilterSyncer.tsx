"use client";

import { useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { FilterTag } from "@/lib/product-filters";

export default function FilterSyncer({ tags }: { tags: FilterTag[] }) {
  const { setAvailableTags } = useSidebar();

  useEffect(() => {
    setAvailableTags(tags);
  }, [tags, setAvailableTags]);

  return null;
}
