/* Shared progress rules. Quiz answers are append-only; challenge unlocks are completion-based. */
(() => {
  const questions = new Map((window.COOKPATH_QUESTIONS || []).map(q => [q.id, q]));
  const fresh = () => ({completed: [], qnaAnswers: {}, dayCompletions: {}, taskReviews: {}, evidenceEnabled:false});
  function normalize(value) {
    const input = value && typeof value === 'object' ? value : {};
    const result = fresh();
    result.evidenceEnabled = input.evidenceEnabled === true;
    for (const [key,review] of Object.entries(input.taskReviews || {})) {
      const id=Number(key), feedback=review?.feedback;
      if (!Number.isInteger(id) || id<1 || id>150 || !['approved','retry'].includes(review?.status) || !feedback || typeof feedback.feedback_en!=='string' || typeof feedback.feedback_el!=='string') continue;
      result.taskReviews[id] = {status:review.status,feedback:{feedback_en:feedback.feedback_en.slice(0,800),feedback_el:feedback.feedback_el.slice(0,800),checks:(Array.isArray(feedback.checks)?feedback.checks:[]).filter(c=>c&&[0,1].includes(c.id)).slice(0,2).map(c=>({id:c.id,met:c.met===true,note_en:String(c.note_en||'').slice(0,800),note_el:String(c.note_el||'').slice(0,800)}))}};
    }
    result.completed = [...new Set((Array.isArray(input.completed) ? input.completed : []).filter(id => Number.isInteger(id) && id >= 1 && id <= 150))].sort((a,b) => a-b);
    for (const [key, answer] of Object.entries(input.qnaAnswers || {})) {
      const q = questions.get(Number(key));
      if (!q || !answer || !Number.isInteger(answer.selectedIndex) || answer.selectedIndex < 0 || answer.selectedIndex > 2) continue;
      result.qnaAnswers[q.id] = {selectedIndex: answer.selectedIndex, correct: answer.selectedIndex === q.correctIndex};
      if (typeof answer.answeredAt === 'string') result.qnaAnswers[q.id].answeredAt = answer.answeredAt;
    }
    for (let challenge = 1; challenge <= 30; challenge++) {
      const tasksDone = Array.from({length:5},(_,i) => (challenge-1)*5+i+1).every(id => result.completed.includes(id));
      const quiz = [...questions.values()].filter(q => q.day === challenge);
      const quizDone = quiz.length === 10 && quiz.every(q => result.qnaAnswers[q.id] !== undefined);
      if (tasksDone && quizDone) result.dayCompletions[challenge] = {complete:true};
    }
    return result;
  }
  function available(state, challenge) {
    return Number.isInteger(challenge) && challenge >= 1 && challenge <= 30 && Array.from({length:challenge-1},(_,i)=>i+1).every(id=>state.dayCompletions[id]);
  }
  function answer(state, questionId, selectedIndex) {
    const next = normalize(state), q = questions.get(questionId);
    if (!q || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 2) throw new Error('Invalid answer');
    if (next.qnaAnswers[questionId] !== undefined) return next;
    if (!available(next, q.day)) throw new Error('Challenge is locked');
    next.qnaAnswers[questionId] = {selectedIndex,correct:selectedIndex===q.correctIndex,answeredAt:new Date().toISOString()};
    return normalize(next);
  }
  function completeTask(state, taskId) {
    const next = normalize(state);
    if (!Number.isInteger(taskId) || taskId < 1 || taskId > 150) throw new Error('Invalid task');
    if (next.completed.includes(taskId)) return next;
    if (!available(next, Math.ceil(taskId/5))) throw new Error('Challenge is locked');
    next.completed.push(taskId);
    return normalize(next);
  }
  function summarize(value) {
    const state = normalize(value);
    const challenges = Array.from({length:30},(_,index) => {
      const number = index + 1, quiz = [...questions.values()].filter(q => q.day === number);
      const submitted = quiz.filter(q => state.qnaAnswers[q.id] !== undefined);
      const correct = submitted.filter(q => state.qnaAnswers[q.id].correct).length;
      return {number, tasks: state.completed.filter(id => Math.ceil(id/5) === number).length,
        answered: submitted.length, correct, wrong: submitted.length-correct,
        accuracy: submitted.length ? correct/submitted.length*100 : null,
        complete: !!state.dayCompletions[number], available: available(state,number)};
    });
    const answered = challenges.reduce((sum,c) => sum+c.answered,0);
    const correct = challenges.reduce((sum,c) => sum+c.correct,0);
    return {tasks: state.completed.length, taskTotal:150, answered, questionTotal:questions.size,
      correct, wrong:answered-correct, unanswered:questions.size-answered,
      accuracy:answered ? correct/answered*100 : null,
      completedChallenges:challenges.filter(c => c.complete).length, challengeTotal:30, challenges};
  }
  window.COOKPATH_PROGRESS = {fresh, normalize, available, answer, completeTask, summarize};
})();
