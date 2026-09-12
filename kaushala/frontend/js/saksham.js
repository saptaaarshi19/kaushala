const STAGES = ["beginner", "amateur", "professional", "mastered"];

function nextStage(stage) {
  const index = STAGES.indexOf(stage);
  return STAGES[Math.min(index + 1, STAGES.length - 1)];
}

function getQuestionSet(skillName, stage) {
  const level = stage === "beginner" ? "basic" : stage === "amateur" ? "applied" : "advanced";
  return [
    {
      prompt: `Which approach best demonstrates ${level} knowledge of ${skillName}?`,
      options: [
        "Memorising a definition without applying it",
        "Explaining the concept and applying it to a realistic problem",
        "Skipping the underlying principles",
        "Relying only on someone else's answer",
      ],
      answer: 1,
    },
    {
      prompt: `When working with ${skillName}, what should you do first?`,
      options: [
        "Clarify the goal, context, and constraints",
        "Choose the most complicated solution",
        "Avoid checking the result",
        "Copy an unrelated example",
      ],
      answer: 0,
    },
    {
      prompt: `What is the strongest evidence of progress in ${skillName}?`,
      options: [
        "Claiming confidence without an example",
        "Completing a relevant task and explaining the reasoning",
        "Collecting more terminology",
        "Repeating the same unverified attempt",
      ],
      answer: 1,
    },
  ];
}

function scoreAttempt(questions, answers) {
  const correct = questions.reduce((total, question, index) => (
    total + (answers[index] === question.answer ? 1 : 0)
  ), 0);
  const total = questions.length;
  const ratio = total ? correct / total : 0;
  return { correct, total, ratio, passed: ratio >= 2 / 3 };
}
