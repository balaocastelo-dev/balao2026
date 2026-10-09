import { GET as feed } from "../rss.xml/route";

// O mesmo feed em um segundo endereço, para quem já assinava /blog/feed.xml.
export const revalidate = 3600;
export const GET = feed;
