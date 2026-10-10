import { verbsData } from "./verbs";
import { imperativData } from "./imperativ";

export { verbsData, imperativData };

export const combinedVerbsData = verbsData.map((verb) => {
  const imperativForms = imperativData.find(
    (imperativVerb) => imperativVerb.infinitive === verb.infinitive,
  );

  return imperativForms
    ? {
        ...verb,
        du: imperativForms.du,
        ihr: imperativForms.ihr,
        Sie: imperativForms.Sie,
      }
    : verb;
});
