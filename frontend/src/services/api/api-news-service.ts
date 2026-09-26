import type { CampusNewsItem } from "@/features/news/types/campus-news";
import type { NewsService } from "@/services/contracts/news-service";
import { ServiceError } from "@/services/errors/service-error";

async function request<T>(path: string, token?: string): Promise<T> {
  const url = token
    ? new URL(`/api/v1/${path}`, process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000")
    : `/api/news/${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: token ? undefined : "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (cause) {
    throw new ServiceError("Cannot reach campus news services.", "network", {
      cause,
    });
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !("data" in result)) {
    throw new ServiceError(result?.error?.message ?? "Campus news request failed.");
  }
  return result.data as T;
}

export class ApiNewsService implements NewsService {
  listItems(token?: string): Promise<readonly CampusNewsItem[]> {
    return request<CampusNewsItem[]>("news?limit=100", token);
  }

  getItem(id: string, token?: string): Promise<CampusNewsItem> {
    return request<CampusNewsItem>(`news/${id}`, token);
  }
}
