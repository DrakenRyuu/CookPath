(() => {
  const tasks = window.COOKPATH_TASKS || [];
  const choose = window.COOKPATH_I18N?.choose || (english => english);
  const whyDistractors = [
    choose('It is mainly for appearance and has little effect on safety, texture, or flavor.', 'Αφορά κυρίως την εμφάνιση και επηρεάζει ελάχιστα την ασφάλεια, την υφή ή τη γεύση.'),
    choose('It lets you skip tasting and doneness checks because the result is guaranteed.', 'Εξασφαλίζει το αποτέλεσμα, οπότε μπορείτε να παραλείψετε τη δοκιμή και τον έλεγχο του ψησίματος.'),
    choose('It is mostly a speed shortcut, so careful control is not needed.', 'Εξοικονομεί χρόνο, οπότε δεν χρειάζεται προσεκτικός έλεγχος.'),
    choose('It matters only in restaurant kitchens and has little value at home.', 'Έχει σημασία μόνο στην επαγγελματική κουζίνα και ελάχιστη αξία στο σπίτι.'),
    choose('It means you no longer need to adjust heat, timing, or seasoning.', 'Δεν χρειάζεται πλέον να προσαρμόζετε τη φωτιά, τον χρόνο ή τα καρυκεύματα.'),
    choose('It adds steps without changing the final result.', 'Προσθέτει βήματα χωρίς να αλλάζει το τελικό αποτέλεσμα.'),
    choose('It works only for meat, not for vegetables, grains, or sauces.', 'Λειτουργεί μόνο για κρέας και όχι για λαχανικά, δημητριακά ή σάλτσες.'),
    choose('It replaces careful preparation because cooking fixes uneven ingredients.', 'Αντικαθιστά την προσεκτική προετοιμασία, επειδή το μαγείρεμα διορθώνει τις ανομοιομορφίες.'),
    choose('It is a strict rule that matters more than what the ingredients are doing.', 'Είναι αυστηρός κανόνας που έχει μεγαλύτερη σημασία από το πώς συμπεριφέρονται τα υλικά.'),
    choose('It prevents food from changing texture as it cooks.', 'Εμποδίζει την αλλαγή υφής του φαγητού κατά το μαγείρεμα.'),
    choose('It guarantees the same result even when heat and ingredient size change.', 'Εγγυάται το ίδιο αποτέλεσμα, ακόμη κι αν αλλάξει η ένταση της φωτιάς ή το μέγεθος των υλικών.'),
    choose('It is useful only when cooking a large amount of food.', 'Είναι χρήσιμο μόνο όταν μαγειρεύετε μεγάλη ποσότητα φαγητού.')
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
        choose('Why it matters', 'Γιατί έχει σημασία'),
        choose(`Why does “${task.title}” matter?`, `Γιατί έχει σημασία το βήμα «${task.title}»;`),
        task.why,
        [firstWrong, secondWrong],
        task.why,
        task.id
      ),
      makeQuestion(
        task,
        firstQuestionNumber + 1,
        choose('Technique', 'Τεχνική'),
        choose(`Which method best matches “${task.title}”?`, `Ποια μέθοδος αντιστοιχεί καλύτερα στο βήμα «${task.title}»;`),
        task.how,
        [methodA, methodB],
        choose(`Do it this way: ${task.how} Why it matters: ${task.why}`, `Τρόπος εκτέλεσης: ${task.how} Γιατί έχει σημασία: ${task.why}`),
        task.id + 1
      )
    ];
  });
})();
