"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ModeToggle } from "@/components/custom/switch-dark";
import { CommonProgrammingLanguage, TrendingPeriod } from "@/types/repo";

export function TrendingTabs() {
  const router = useRouter();
  const params = useParams();

  const [sinces, setSinces] = useState(decodeURIComponent(params.date as TrendingPeriod || TrendingPeriod.Daily));
  const [language, setLanguage] = useState(decodeURIComponent(params.language as CommonProgrammingLanguage || CommonProgrammingLanguage.All));

  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = `/${encodeURIComponent(sinces)}/${encodeURIComponent(language)}`;
    router.push(url.pathname);    
  }, [router, sinces, language]);


  return (
    <div className="flex flex-col gap-2 bg-accent p-2 border-x border-t relative">
      <div className="flex gap-1 flex-col items-start md:flex-row">
        <div className="md:font-bold text-sm text-muted-foreground w-20 flex-shrink-0">Since</div>
        <RadioGroup defaultValue={sinces} className="flex items-center gap-2 border p-2 rounded-md bg-background" onValueChange={(v) => setSinces(v as TrendingPeriod)}>
          {
            Object.values(TrendingPeriod).map((period) => (
              <Label className="flex items-center space-x-2 cursor-pointer" key={period}>
                <RadioGroupItem value={period} id={period} />
                <span className="text-muted-foreground">{period}</span>
              </Label>
            ))
          }
        </RadioGroup>
        <ModeToggle className="absolute top-0 right-0" />
      </div>

      <div className="flex gap-1 flex-col items-start md:flex-row">
        <div className="md:font-bold text-sm text-muted-foreground w-20 flex-shrink-0">Language</div>
        <RadioGroup defaultValue={language} className="flex flex-wrap gap-2 border p-2 rounded-md bg-background" onValueChange={(v) => setLanguage(v as CommonProgrammingLanguage)}>
          {
            Object.values(CommonProgrammingLanguage).map((language) => (
              <Label className="flex items-center space-x-2 cursor-pointer" key={language}>
                <RadioGroupItem value={language} id={language} />
                <span className="text-muted-foreground">{language}</span>
              </Label>
            ))
          }
        </RadioGroup>
      </div>
    </div>
  );
}
