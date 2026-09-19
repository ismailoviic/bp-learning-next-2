/**
 * Phase 2 — APPRENDRE lesson library.
 *
 * Content is fictional practice material for communication training.
 * It does not constitute clinical advice, pharmacological guidance or
 * professional medical content. All situations and names are invented.
 *
 * reviewStatus: "DÉMO — Contenu illustratif non revu par un professionnel de santé"
 */
export const lessons = [
  {
    id: "decouvrir_besoin",
    title: "Découvrir le besoin réel",
    objective:
      "Poser une question ouverte pour comprendre ce que la personne cherche vraiment, avant de proposer quoi que ce soit.",
    explanation:
      "Une demande au comptoir peut sembler claire mais cacher une attente différente. Avant de suggérer un produit, assurez-vous de comprendre la situation : depuis quand, pour qui, dans quel contexte. Une question ouverte — « Qu'est-ce qui vous amène aujourd'hui ? » — permet à la personne de s'exprimer à son rythme.",
    example: {
      customer: "Je cherche quelque chose pour la fatigue.",
      employee:
        "Bien sûr. Vous vous sentez fatigué depuis combien de temps, et est-ce que c'est plutôt en journée, le soir, ou tout le temps ?",
    },
    check: {
      id: "decouvrir_besoin_check",
      question: "Quelle question permet le mieux de comprendre le besoin ?",
      answers: [
        {
          id: "a",
          text: "Vous voulez des vitamines ou un complément ?",
          why: "Proposer des options d'emblée oriente la réponse avant d'avoir compris la situation.",
        },
        {
          id: "b",
          text: "Qu'est-ce qui vous amène aujourd'hui ?",
          why: "Une question ouverte laisse la personne décrire sa situation sans la diriger.",
        },
        {
          id: "c",
          text: "Vous dormez bien la nuit ?",
          why: "C'est une question fermée sur un seul aspect, alors que le besoin est encore inconnu.",
        },
      ],
      correct: "b",
    },
    relatedScenario: "besoin_flou",
    reviewStatus:
      "DÉMO — Contenu illustratif non revu par un professionnel de santé",
  },
  {
    id: "question_claire",
    title: "Poser une question claire et utile",
    objective:
      "Formuler une seule question précise dont la réponse change réellement ce que vous allez proposer.",
    explanation:
      "Chaque question doit servir à quelque chose de concret. Demandez-vous : si la personne répond A plutôt que B, est-ce que ma suggestion change ? Si non, la question n'est pas utile ici. Une seule question bien choisie vaut mieux que trois questions vagues. Évitez les questions qui semblent intrusives sans raison visible — expliquez brièvement pourquoi vous demandez.",
    example: {
      customer: "J'ai besoin de quelque chose pour la gorge.",
      employee:
        "Pour vous aider à trouver ce qui convient le mieux : c'est plutôt pour soulager une irritation ou pour une toux ?",
    },
    check: {
      id: "question_claire_check",
      question:
        "Laquelle de ces questions est la plus utile au comptoir ?",
      answers: [
        {
          id: "a",
          text: "Vous avez vu un médecin récemment ?",
          why: "Cette question est intrusive et ne précise pas directement ce que vous allez proposer pour une irritation de gorge bénigne.",
        },
        {
          id: "b",
          text: "C'est pour vous ou pour quelqu'un d'autre ?",
          why: "Utile dans certains contextes, mais ici ce n'est pas la question qui va changer votre suggestion pour la gorge.",
        },
        {
          id: "c",
          text: "C'est plutôt une irritation légère ou une toux ?",
          why: "Cette précision change directement ce que vous allez proposer, et reste simple à répondre.",
        },
      ],
      correct: "c",
    },
    relatedScenario: "besoin_clair",
    reviewStatus:
      "DÉMO — Contenu illustratif non revu par un professionnel de santé",
  },
  {
    id: "gerer_incertitude",
    title: "Gérer l'incertitude avec honnêteté",
    objective:
      "Reconnaître quand vous n'avez pas la réponse et orienter clairement vers la bonne personne.",
    explanation:
      "Dire « je ne suis pas certain » est un signe de professionnalisme, pas une faiblesse. Si une question dépasse votre rôle ou vos connaissances, transmettez-la au pharmacien plutôt que de risquer une réponse inexacte. Vous pouvez préparer le passage : expliquer brièvement ce que la personne a demandé aide à un transfert fluide.",
    example: {
      customer:
        "Est-ce que je peux prendre ce produit avec mon traitement habituel ?",
      employee:
        "C'est une question importante. Je vais vous orienter vers notre pharmacien qui pourra vous répondre avec précision — je lui explique votre demande.",
    },
    check: {
      id: "gerer_incertitude_check",
      question:
        "Comment réagir si une question dépasse votre domaine de compétence ?",
      answers: [
        {
          id: "a",
          text: "Répondre au mieux avec les informations disponibles sur l'emballage.",
          why: "Les informations de l'emballage ne remplacent pas un avis pharmaceutique sur des interactions ou des contre-indications.",
        },
        {
          id: "b",
          text: "Dire que vous ne savez pas et orienter vers le pharmacien.",
          why: "Reconnaître la limite de votre rôle et passer la main protège la personne et reste honnête.",
        },
        {
          id: "c",
          text: "Suggérer à la personne de chercher sur Internet.",
          why: "Les sources en ligne ne sont pas fiables pour des questions d'interactions ou de contre-indications.",
        },
      ],
      correct: "b",
    },
    relatedScenario: "medication_concern",
    reviewStatus:
      "DÉMO — Contenu illustratif non revu par un professionnel de santé",
  },
  {
    id: "option_complementaire",
    title: "Expliquer une option complémentaire",
    objective:
      "Présenter une option pertinente sans pression, en montrant pourquoi elle correspond au besoin exprimé.",
    explanation:
      "Une suggestion pertinente part du besoin que la personne a exprimé — pas d'un objectif de vente. Expliquez en une phrase pourquoi l'option est liée à ce besoin. Laissez toujours la personne décider, sans relance. Si elle dit non, c'est une réponse complète. Si aucun produit ne correspond clairement, il n'est pas nécessaire d'en proposer un.",
    example: {
      customer:
        "J'ai pris le sirop que vous m'avez conseillé. La gorge va mieux, mais mes lèvres sont très sèches depuis le froid.",
      employee:
        "C'est fréquent par temps froid. On a un baume lèvres simple, sans parfum — ça peut aider si vous souhaitez. Ce n'est pas indispensable, c'est selon votre préférence.",
    },
    check: {
      id: "option_complementaire_check",
      question:
        "Quand est-il approprié de proposer une option complémentaire ?",
      answers: [
        {
          id: "a",
          text: "Systématiquement, pour chaque achat.",
          why: "Proposer à chaque achat, sans lien avec le besoin, peut sembler commercial et met la personne dans une position inconfortable.",
        },
        {
          id: "b",
          text: "Quand un produit complémentaire répond clairement à un besoin que la personne a exprimé.",
          why: "La suggestion est pertinente et honnête quand elle part d'un besoin réel — et la personne reste libre de refuser.",
        },
        {
          id: "c",
          text: "Jamais, pour ne pas paraître commercial.",
          why: "Ne jamais signaler une option utile prive la personne d'une information qui pourrait l'aider.",
        },
      ],
      correct: "b",
    },
    relatedScenario: "besoin_clair",
    reviewStatus:
      "DÉMO — Contenu illustratif non revu par un professionnel de santé",
  },
];
