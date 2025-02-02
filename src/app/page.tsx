
import { getRepos } from "@/actions/repos";

import { TrendingTabs } from "@/components/custom/trending-tabs";
import { Repos } from "@/components/custom/repos";

interface IProps {
  searchParams: Promise<{
    sinces?: string;
    language?: string;
  }>;
}

export default async function Home(props: IProps) {
  const { searchParams } = props;
  const containerWidthClassName =
    "px-4 w-full sm:w-[600px] md:w-[700px] lg:w-[1000px] xl:w-[1200px] m-auto pb-0";

  const params = await searchParams;
  const date = params.sinces || "daily";
  const language = params.language || "all";
  const repos = await getRepos(date, language);
  

  return (
    <div className="py-4">
      <header className={containerWidthClassName}>
        <TrendingTabs />
      </header>
      <main className={`${containerWidthClassName}`}>
        <Repos repos={repos} />
      </main>
    </div>
  );
}
