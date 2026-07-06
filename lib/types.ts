export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

export interface Competitor {
  name: string;
  website: string;
}

export interface CompanyInfo {
  name: string;
  website: string;
  phone: string | null;
  address: string | null;
  productsServices: string[];
  painPoints: string[];
  summary: string;
}

export interface ResearchResult {
  company: CompanyInfo;
  competitors: Competitor[];
  crawledPages: { url: string; title: string }[];
  modelUsed: string;
  generatedAt: string;
}

export interface ResearchRequestBody {
  input: string;
  model?: string;
}
