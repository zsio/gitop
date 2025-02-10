
import { redirect } from "next/navigation";

export default async function Home() {
    redirect("/daily/all");
    return <></>;
}
