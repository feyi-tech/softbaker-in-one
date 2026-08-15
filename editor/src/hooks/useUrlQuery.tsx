import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { objEmpty } from "../utils/f";

// Define the type for the query object
type QueryObject = { [key: string]: string | string[] | undefined };

const UrlContext = createContext<QueryObject | null | undefined>(null);

// ✅ Safer & more compatible query string parser
const urlToQuery = (path: string): QueryObject => {
  const query: QueryObject = {};
  const searchIndex = path.indexOf("?");

  if (searchIndex === -1) return query;

  const search = path.substring(searchIndex + 1);
  const pairs = search.split("&");

  for (const pair of pairs) {
    const [rawKey, rawValue] = pair.split("=");
    if (!rawKey) continue;

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue || "");

    if (query[key]) {
      // Handle repeated keys as array
      if (Array.isArray(query[key])) {
        (query[key] as string[]).push(value);
      } else {
        query[key] = [query[key] as string, value];
      }
    } else {
      query[key] = value;
    }
  }

  return query;
};

export const UrlProvider: React.FC<{ [x: string]: any }> = ({ ...props }) => {
  const router = useRouter();
  const { query, asPath, isReady } = router;
  const [queryOr, setQueryOr] = useState<QueryObject | null | undefined>();

  useEffect(() => {
    if (!isReady) return;

    const fallbackQuery = urlToQuery(asPath || "");
    const activeQuery = !objEmpty(query) ? query : fallbackQuery;
    setQueryOr(activeQuery || {});
  }, [query, asPath, isReady]);

  return <UrlContext.Provider value={queryOr} {...props} />;
};

// Hook to use anywhere in your app
export default function useUrlQuery(): QueryObject | null | undefined {
  return useContext(UrlContext);
}