export const normalizeGermanAnswer = (value) =>
  String(value)
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

export const getCorrectAnswerText = (verb, type) => {
  if (!verb) return "";
  if (type === "translation") return verb.translation;
  if (type === "prateritum") return verb.prateritum;
  if (type === "partizip") return `${verb.auxiliary} ${verb.partizip2}`;
  if (type === "auxiliary") return verb.auxiliary;

  return `${verb.prateritum}, ${verb.auxiliary} ${verb.partizip2}`;
};

export const isWrittenAnswerCorrect = (answer, verb, type) => {
  const correctAnswer = getCorrectAnswerText(verb, type).trim();
  const userAnswer = answer.trim();

  if (["all-forms", "prateritum", "partizip"].includes(type)) {
    return normalizeGermanAnswer(userAnswer) === normalizeGermanAnswer(correctAnswer);
  }

  if (type === "translation") {
    const normalizedUser = userAnswer.toLocaleLowerCase("uk-UA");
    const normalizedCorrect = correctAnswer.toLocaleLowerCase("uk-UA");

    return (
      normalizedUser === normalizedCorrect ||
      verb.translation.toLocaleLowerCase("uk-UA").includes(normalizedUser) ||
      normalizedUser.includes(verb.translation.toLocaleLowerCase("uk-UA"))
    );
  }

  return (
    userAnswer.toLocaleLowerCase("de-DE") ===
    correctAnswer.toLocaleLowerCase("de-DE")
  );
};
