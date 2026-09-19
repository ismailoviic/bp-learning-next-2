export const principles = [
  {
    id: "langue",
    title: "Laisser le choix de la langue",
    label: "Écouter",
    text: "Proposez un français simple ou une explication orale en darija. Demandez la préférence, sans la supposer.",
    example: "« Dans quelle langue préférez-vous que je vous explique ? »",
  },
  {
    id: "expliquer",
    title: "Une étape à la fois",
    label: "Expliquer",
    text: "Découpez l’information en petites étapes. Évitez le jargon et utilisez des mots du quotidien.",
    example:
      "« Commençons par la première étape, puis nous verrons la suite. »",
  },
  {
    id: "comprendre",
    title: "Vérifier sans juger",
    label: "Accompagner",
    text: "Invitez la personne à reformuler pour vérifier votre explication. Accueillez ses questions avec respect.",
    example:
      "« Pour vérifier si j’ai été clair, comment résumeriez-vous cette étape ? »",
  },
];
export const dialogue = [
  {
    id: "preference",
    title: "Accueillir une préférence",
    customer:
      "Je lis le français, mais je comprends mieux certaines explications en darija. Est-ce possible ?",
    answers: [
      {
        id: "a",
        text: "Tout est déjà écrit en français sur l’affiche.",
        why: "L’affiche ne répond pas à sa demande d’explication orale. Demandez plutôt sa préférence.",
      },
      {
        id: "b",
        text: "Bien sûr. Préférez-vous commencer en français simple ou par une explication orale en darija ?",
        why: "Vous reconnaissez sa demande et lui laissez le choix, sans supposer ce qui lui convient.",
      },
      {
        id: "c",
        text: "Je vais choisir la langue pour aller plus vite.",
        why: "Choisir à sa place peut compliquer la compréhension. Une courte question permet de respecter sa préférence.",
      },
    ],
    correct: "b",
  },
  {
    id: "structure",
    title: "Rendre l’explication accessible",
    customer:
      "Commençons en français simple. Je n’ai pas bien compris les trois étapes indiquées.",
    answers: [
      {
        id: "a",
        text: "D’accord. Regardons d’abord la première étape, puis vous me direz comment vous la comprenez.",
        why: "Une étape à la fois et une reformulation permettent de vérifier la compréhension avant de poursuivre.",
      },
      {
        id: "b",
        text: "Je vais relire les trois étapes plus lentement, sans changer les mots.",
        why: "Ralentir ne suffit pas toujours. Simplifiez les mots et présentez une seule étape avant de vérifier la compréhension.",
      },
      {
        id: "c",
        text: "Ce document est pourtant très clair pour la plupart des personnes.",
        why: "La comparaison peut mettre la cliente mal à l’aise. Adaptez votre explication à sa difficulté.",
      },
    ],
    correct: "a",
  },
  {
    id: "verification",
    title: "Accompagner la prochaine étape",
    customer:
      "J’ai compris la première étape. Je dois aussi l’expliquer à ma mère à la maison.",
    answers: [
      {
        id: "a",
        text: "Mémorisez simplement tout ce que je viens de dire.",
        why: "La mémorisation seule n’aide pas à transmettre une explication. Proposez un résumé court.",
      },
      {
        id: "b",
        text: "Je ne peux rien faire si elle n’est pas présente.",
        why: "Vous pouvez aider à transmettre les consignes générales avec un résumé, sans donner de conseil clinique.",
      },
      {
        id: "c",
        text: "Je peux vous remettre un résumé très court. Pour toute question de santé précise, adressez-vous à un pharmacien.",
        why: "Le résumé facilite la transmission. Vous gardez une limite claire pour les questions de santé.",
      },
    ],
    correct: "c",
  },
];
export const checks = [
  {
    id: "preference",
    title: "Préférence linguistique",
    customer: "Quelle question laisse réellement le choix ?",
    answers: [
      {
        id: "a",
        text: "Vous parlez sûrement darija, n’est-ce pas ?",
        why: "Cette question suppose déjà une préférence.",
      },
      {
        id: "b",
        text: "Préférez-vous le français simple ou une explication orale en darija ?",
        why: "Vous proposez des options et laissez la personne choisir.",
      },
      {
        id: "c",
        text: "Vous savez lire le français ?",
        why: "La capacité à lire ne dit pas dans quelle langue la personne préfère une explication.",
      },
    ],
    correct: "b",
  },
  {
    id: "structure",
    title: "Structurer l’explication",
    customer: "Quelle séquence aide le mieux à suivre ?",
    answers: [
      {
        id: "a",
        text: "Tout le contenu, puis une question à la fin.",
        why: "Beaucoup d’informations d’un coup peuvent rendre les difficultés moins visibles.",
      },
      {
        id: "b",
        text: "Jargon, répétition, conclusion.",
        why: "Répéter des termes complexes ne les rend pas plus accessibles.",
      },
      {
        id: "c",
        text: "Une étape, une reformulation, puis l’étape suivante.",
        why: "Chaque étape est comprise avant de passer à la suivante.",
      },
    ],
    correct: "c",
  },
  {
    id: "verification",
    title: "Vérifier sans juger",
    customer: "Quelle formulation respecte la personne ?",
    answers: [
      {
        id: "a",
        text: "Pour vérifier si j’ai été clair, comment résumeriez-vous la première étape ?",
        why: "Vous vérifiez la qualité de votre explication, sans mettre la personne à l’épreuve.",
      },
      {
        id: "b",
        text: "Répétez exactement ce que je viens de dire.",
        why: "Répéter mot à mot ne prouve pas que le sens a été compris.",
      },
      {
        id: "c",
        text: "Vous avez compris, oui ou non ?",
        why: "Une réponse oui/non ne permet pas de savoir ce qui a été compris.",
      },
    ],
    correct: "a",
  },
];
