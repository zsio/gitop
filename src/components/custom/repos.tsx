"use client";

import "@animxyz/core";
import { Star, GitFork } from "lucide-react";
import { XyzTransitionGroup } from "@animxyz/react";
import Link from "next/link";
// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerHeader,
//     DrawerTitle,
//     DrawerTrigger,
//   } from "@/components/ui/drawer";
import { SelectTrendingRepo } from "@/db/schema";

function LanguageColorDot({ color }: { color?: string | null }) {
    return (
      <span
        className="w-3 h-3 rounded-full inline-block"
        style={{ backgroundColor: color || "#586069" }}
      />
    );
  }

export function Repos(props: { repos: SelectTrendingRepo[] }) {
  const { repos } = props;

  return (
    <>
      <XyzTransitionGroup
        appear
        className="flex-col border"
        xyz="fade down-5 stagger-0.5 out-stagger-0"
      >
        {repos.map((repo) => (
          <div
            key={`${repo.name}-${repo.id}-${repo.filterLanguage}-${repo.filterSinces}`}
            className="p-4 border-b shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Link href={`https://github.com/${repo.user}/${repo.name}`} target="_blank" className="text-lg font-semibold text-primary hover:underline">{repo.user} / {repo.name}</Link>
                {/* <div>
                  <Drawer>
                    <DrawerTrigger>
                      <h2 className="text-lg font-semibold text-blue-500 hover:underline">{repo.user} / {repo.name}</h2>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle className="flex items-center justify-center">
                          <Link
                            href={`https://github.com/${repo.name}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 pb-2 text-xl"
                          >
                            <span className="">{repo.name}</span>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </DrawerTitle>
                        <DrawerDescription>{repo.description}</DrawerDescription>
                        <DrawerDescription>{repo.description}</DrawerDescription>
                      </DrawerHeader>
                    </DrawerContent>
                  </Drawer>
                </div> */}

                <div className="my-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {repo.programmingLanguage && (
                    <div className="flex items-center gap-1">
                      <LanguageColorDot color={repo.repoLanguageColor} />
                      <span>{repo.programmingLanguage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazers.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <span>
                      {repo.todayStargazers?.toLocaleString() ?? 0}{" "}
                      <span className="text-muted-foreground">stars {repo.filterSinces === "daily" ? "today" : `this ${repo.filterSinces}`}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </XyzTransitionGroup>
    </>
  );
}
