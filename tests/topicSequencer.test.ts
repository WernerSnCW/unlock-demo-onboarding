import { describe, it, expect } from 'vitest';
import { sequenceTopics, type Topic } from '../server/content/topicSequencer';

function topic(id: string, dependsOn: string[] = [], order = 0): Topic {
  return { id, kind: 'concept', title: id, dependsOn, order, render: () => ({ prose: [], tables: [] }) };
}

describe('sequenceTopics', () => {
  it('orders a topic after everything it depends on', () => {
    const result = sequenceTopics([topic('c', ['b']), topic('b', ['a']), topic('a')]);
    const ids = result.map((t) => t.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'));
  });

  it('is deterministic across repeated calls on the same graph', () => {
    const topics = [topic('c', ['a']), topic('b', ['a']), topic('a')];
    const first = sequenceTopics(topics).map((t) => t.id);
    const second = sequenceTopics(topics).map((t) => t.id);
    expect(second).toEqual(first);
  });

  it('uses order as a tiebreaker among topics at the same depth', () => {
    const result = sequenceTopics([
      topic('later', ['root'], 10),
      topic('earlier', ['root'], 1),
      topic('root'),
    ]);
    const ids = result.map((t) => t.id);
    expect(ids.indexOf('earlier')).toBeLessThan(ids.indexOf('later'));
  });

  it('throws on a circular dependency', () => {
    expect(() => sequenceTopics([topic('a', ['b']), topic('b', ['a'])])).toThrow(/cycle/i);
  });

  it('throws when a topic depends on an id that does not exist', () => {
    expect(() => sequenceTopics([topic('a', ['missing'])])).toThrow(/unknown topic/i);
  });
});
