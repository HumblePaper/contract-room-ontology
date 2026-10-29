export type NodeStatus = 'draft' | 'reviewed' | 'authoritative';
export type Confidence = 'high' | 'medium' | 'low';
export type Strength = 'always' | 'usually' | 'sometimes';

export interface Relation {
  rel: string;
  to: string;
  strength?: Strength;
  note?: string;
  since?: number;
  capacity?: string;
  order?: number;
  from?: string;
  until?: string;
}

export interface Variant {
  facet: string;
  value: string;
  heading: string;
  md: string;
  html: string;
}

export interface Section {
  heading: string;
  md: string;
  html: string;
  variants: Variant[];
}

export interface ReferenceNode {
  id: string;
  type: string;
  slug: string;
  name: string;
  aliases: string[];
  summary: string;
  facets: Record<string, string[]>;
  attributes: Record<string, unknown>;
  relations: Relation[];
  sources: string[];
  status: NodeStatus;
  revised: string;
  confidence: Confidence;
  sections: Section[];
}

export interface ContentItem {
  id: string;
  kind: string;
  slug: string;
  title: string;
  summary: string;
  about: string[];
  facets: Record<string, string[]>;
  sources: string[];
  status: NodeStatus;
  published: string;
  revised: string;
  byline: string;
  block: Record<string, unknown>;
  sections: Section[];
}

export interface GraphEdge {
  from: string;
  rel: string;
  to: string;
  inverse: string;
  strength?: Strength;
  note?: string;
  since?: number;
  capacity?: string;
  order?: number;
}

export interface Graph {
  generated: string;
  vocab: string;
  nodes: ReferenceNode[];
  content: ContentItem[];
  edges: GraphEdge[];
}
