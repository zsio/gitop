import 'dotenv/config';
import { GithubTrending } from "@/services/github-trending";

const githubTrending = new GithubTrending();

githubTrending.run().then(res => {
  console.log(res);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});