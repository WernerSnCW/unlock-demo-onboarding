// Demo helper: fill a Likert (1–5) questionnaire with random answers.
// Used by the "Randomise answers" button on the Beliefs and Outlook screens so a
// salesperson can jump past a questionnaire without clicking every row.
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export function randomLikert(): LikertValue {
  return (Math.floor(Math.random() * 5) + 1) as LikertValue;
}

// Assign a fresh random 1–5 answer to every question id via the given setter.
export function randomizeLikertResponses<Id extends string>(
  ids: readonly Id[],
  setResponse: (id: Id, value: LikertValue) => void,
): void {
  for (const id of ids) setResponse(id, randomLikert());
}
