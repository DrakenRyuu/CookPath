(() => {
  const tasks = window.COOKPATH_TASKS || [];
  const whyDistractors = [
    'It is mainly for appearance and has little effect on safety, texture, or flavor.',
    'It lets you skip tasting and doneness checks because the result is guaranteed.',
    'It is mostly a speed shortcut, so careful control is not needed.',
    'It matters only in restaurant kitchens and has little value at home.',
    'It means you no longer need to adjust heat, timing, or seasoning.',
    'It adds steps without changing the final result.',
    'It works only for meat, not for vegetables, grains, or sauces.',
    'It replaces careful preparation because cooking fixes uneven ingredients.',
    'It is a strict rule that matters more than what the ingredients are doing.',
    'It prevents food from changing texture as it cooks.',
    'It guarantees the same result even when heat and ingredient size change.',
    'It is useful only when cooking a large amount of food.'
  ];
  let nextId = 1;

  function placeChoices(correct, distractors, seed) {
    const choices = new Array(3);
    const correctIndex = seed % 3;
    choices[correctIndex] = correct;
    let distractorIndex = 0;
    for (let i = 0; i < choices.length; i++) {
      if (i !== correctIndex) choices[i] = distractors[distractorIndex++];
    }
    return { choices, correctIndex };
  }

  function makeQuestion(task, questionNumber, kind, prompt, correct, distractors, explanation, seed) {
    const placed = placeChoices(correct, distractors, seed);
    return {
      id: nextId++,
      day: task.day,
      number: questionNumber,
      taskId: task.id,
      taskTitle: task.title,
      theme: task.theme,
      kind,
      prompt,
      choices: placed.choices,
      correctIndex: placed.correctIndex,
      explanation
    };
  }

  window.COOKPATH_QUESTIONS = tasks.flatMap(task => {
    const siblings = tasks.filter(other => other.day === task.day && other.id !== task.id);
    const firstWrong = whyDistractors[(task.id - 1) % whyDistractors.length];
    const secondWrong = whyDistractors[(task.id + 5) % whyDistractors.length];
    const methodA = siblings[(task.slot - 1) % siblings.length]?.how || task.how;
    const methodB = siblings[(task.slot + 1) % siblings.length]?.how || task.how;
    const firstQuestionNumber = (task.slot - 1) * 2 + 1;
    return [
      makeQuestion(
        task,
        firstQuestionNumber,
        'Why it matters',
        `Why does “${task.title}” matter?`,
        task.why,
        [firstWrong, secondWrong],
        task.why,
        task.id
      ),
      makeQuestion(
        task,
        firstQuestionNumber + 1,
        'Technique',
        `Which method best matches “${task.title}”?`,
        task.how,
        [methodA, methodB],
        `Do it this way: ${task.how} Why it matters: ${task.why}`,
        task.id + 1
      )
    ];
  });
})();
