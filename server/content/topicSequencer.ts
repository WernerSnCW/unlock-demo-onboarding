export type TopicKind = 'concept' | 'rule' | 'formula' | 'citation';

export interface TopicTable {
  headers: string[];
  rows: string[][];
}

export interface TopicContent {
  prose: string[];
  tables: TopicTable[];
}

export interface Topic {
  id: string;
  kind: TopicKind;
  title: string;
  dependsOn: string[];
  order?: number;
  render: () => TopicContent;
}

/**
 * Topological sort (Kahn's algorithm) over the topic dependency graph.
 * `order` breaks ties between topics that become available at the same time,
 * so authors can nudge sibling ordering without fighting the algorithm.
 */
export function sequenceTopics(topics: Topic[]): Topic[] {
  const byId = new Map(topics.map((t) => [t.id, t]));
  for (const t of topics) {
    for (const dep of t.dependsOn) {
      if (!byId.has(dep)) {
        throw new Error(`Topic "${t.id}" depends on unknown topic "${dep}"`);
      }
    }
  }

  const inDegree = new Map<string, number>(topics.map((t) => [t.id, t.dependsOn.length]));
  const dependents = new Map<string, string[]>(topics.map((t) => [t.id, []]));
  for (const t of topics) {
    for (const dep of t.dependsOn) {
      dependents.get(dep)!.push(t.id);
    }
  }

  const ready = topics.filter((t) => inDegree.get(t.id) === 0);
  const sortReady = (a: Topic, b: Topic) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id);
  ready.sort(sortReady);

  const result: Topic[] = [];
  const queue = [...ready];
  while (queue.length > 0) {
    queue.sort(sortReady);
    const next = queue.shift()!;
    result.push(next);
    for (const depId of dependents.get(next.id)!) {
      const remaining = inDegree.get(depId)! - 1;
      inDegree.set(depId, remaining);
      if (remaining === 0) queue.push(byId.get(depId)!);
    }
  }

  if (result.length !== topics.length) {
    throw new Error('Cycle detected in topic dependency graph');
  }

  return result;
}
