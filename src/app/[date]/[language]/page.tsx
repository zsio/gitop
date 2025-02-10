import { format } from "timeago.js";
import { getRepos } from "@/actions/repos";

import { TrendingTabs } from "@/components/custom/trending-tabs";
import { Repos } from "@/components/custom/repos";
import { CommonProgrammingLanguage, TrendingPeriod } from "@/types/repo";
import { redirect } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
    const dates = Object.values(TrendingPeriod);
    const languages = Object.values(CommonProgrammingLanguage);

    console.log(`[${new Date().toISOString()}] - Generating static params`);

    return dates.flatMap((date) =>
        languages.map((language) => ({
            date,
            language,
        }))
    );
}

export default async function Page(props: {
    params: Promise<{
        date: string;
        language: string;
    }>;
}) {
    const containerWidthClassName =
        "px-4 w-full sm:w-[600px] md:w-[700px] lg:w-[1000px] xl:w-[1200px] m-auto pb-0";

    const params = await props.params;
    const date = params.date;
    const language = params.language;

    if (!Object.values(TrendingPeriod).includes(date as TrendingPeriod)) {
        return redirect(`/${TrendingPeriod.Daily}/all`);
    }

    if (
        !Object.values(CommonProgrammingLanguage).includes(
            language as CommonProgrammingLanguage
        )
    ) {
        return redirect(`/${date}/${CommonProgrammingLanguage.All}`);
    }

    const repos = await getRepos(date, language);

    const lastUpdateTime = repos?.[0]?.createdAt;
    const lastUpdateTimeText = lastUpdateTime ? format(lastUpdateTime) : "";

    return (
        <div className="py-4">
            <header className={containerWidthClassName}>
                <TrendingTabs />
            </header>
            <main className={`${containerWidthClassName}`}>
                <Repos repos={repos} />
            </main>
            <footer className="py-2">
                <div className="flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        Updated at {lastUpdateTimeText}
                    </p>
                </div>
            </footer>
        </div>
    );
}
