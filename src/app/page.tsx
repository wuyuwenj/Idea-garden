"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/app/actions/auth";
import { getTeams } from "@/app/actions/team";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuth().then((valid) => {
      if (!valid) {
        router.replace("/login");
        return;
      }
      getTeams().then((teams) => {
        const t = teams as { slug: string }[];
        if (t.length > 0) {
          router.replace(`/t/${t[0].slug}`);
        } else {
          router.replace("/teams");
        }
      });
    });
  }, [router]);

  return null;
}
