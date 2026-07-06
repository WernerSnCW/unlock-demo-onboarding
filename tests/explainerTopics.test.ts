import { describe, it, expect } from 'vitest';
import { getSequencedTopics } from '../server/content/explainerTopics';

describe('getSequencedTopics', () => {
  it('sequences all ten topics without throwing', () => {
    const topics = getSequencedTopics();
    expect(topics).toHaveLength(10);
  });

  it('places philosophy first (nothing else can come before it)', () => {
    const topics = getSequencedTopics();
    expect(topics[0].id).toBe('philosophy');
  });

  it('places persona-engine after safety-lights (it reuses cash-runway vocabulary)', () => {
    const topics = getSequencedTopics();
    const ids = topics.map((t) => t.id);
    expect(ids.indexOf('safety-lights')).toBeLessThan(ids.indexOf('persona-engine'));
  });

  it('places citations after both persona-engine and scenario-stress', () => {
    const topics = getSequencedTopics();
    const ids = topics.map((t) => t.id);
    expect(ids.indexOf('persona-engine')).toBeLessThan(ids.indexOf('citations'));
    expect(ids.indexOf('scenario-stress')).toBeLessThan(ids.indexOf('citations'));
  });

  it('every topic renders non-empty prose', () => {
    for (const topic of getSequencedTopics()) {
      const content = topic.render();
      expect(content.prose.length, `${topic.id} should have prose`).toBeGreaterThan(0);
    }
  });
});
