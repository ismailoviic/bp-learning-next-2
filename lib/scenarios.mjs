/**
 * Phase 2 — S'ENTRAÎNER scenarios.
 *
 * All situations, names and products are fictional.
 * Reward structure: correct questions, appropriate routing and respectful
 * explanations — not selling a product.
 *
 * Scoring keys:
 *   "recommended" — the best response
 *   "acceptable"  — adequate but not ideal
 *   "poor"        — the response to learn from
 */
export const scenarios = [
  {
    id: "besoin_clair",
    title: "Un besoin clairement exprimé",
    badge: "BESOIN NON CLINIQUE",
    badgeTone: "green",
    context:
      "Un client exprime clairement un besoin de parapharmacie. Il n'y a pas de question médicale.",
    relatedLesson: "option_complementaire",
    steps: [
      {
        id: "besoin_clair_1",
        title: "Comprendre la demande",
        situation:
          "Un client entre et dit directement : « Bonjour, j'ai les lèvres très sèches depuis le froid, vous avez quelque chose de simple ? »",
        answers: [
          {
            id: "a",
            text: "On a plusieurs gammes. Je vous conseille notre pack soin d'hiver complet, c'est le plus vendu.",
            why: "Proposer le pack le plus vendu sans tenir compte de la demande simple passe à côté du besoin exprimé et peut sembler trop commercial.",
            quality: "poor",
          },
          {
            id: "b",
            text: "Oui, j'ai un baume lèvres sans parfum adapté au froid, très simple — je vous le montre.",
            why: "Vous répondez directement à ce qui a été demandé : quelque chose de simple pour les lèvres sèches. C'est la bonne approche.",
            quality: "recommended",
          },
          {
            id: "c",
            text: "C'est pour vous ou pour quelqu'un d'autre ?",
            why: "Cette question n'apporte pas d'information utile ici — le besoin est déjà clair et la question rallonge inutilement l'échange.",
            quality: "acceptable",
          },
        ],
        correct: "b",
      },
      {
        id: "besoin_clair_2",
        title: "Proposer sans pression",
        situation:
          "Après avoir montré le baume, le client dit : « C'est bien ça. Et pour les mains, vous avez aussi ? »",
        answers: [
          {
            id: "a",
            text: "Oui, on a une crème mains spéciale froid juste à côté — je vous la montre si vous voulez.",
            why: "Le client a posé une question directe. Vous y répondez et laissez le choix. C'est un échange simple et honnête.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Oui, et on a aussi un kit lèvres + mains + visage, ça revient moins cher au final.",
            why: "Orienter vers un pack plus cher sans que le client l'ait demandé ajoute une pression non souhaitée.",
            quality: "poor",
          },
          {
            id: "c",
            text: "Pour les mains, je dois vérifier le stock — un moment.",
            why: "Vérifier le stock est légitime, mais ici vous avez la crème mains — répondre directement évite d'inutilement suspendre l'échange.",
            quality: "acceptable",
          },
        ],
        correct: "a",
      },
      {
        id: "besoin_clair_3",
        title: "Clore l'échange positivement",
        situation:
          "Le client a pris le baume et décline la crème mains. Il dit : « Non merci, juste le baume. »",
        answers: [
          {
            id: "a",
            text: "Très bien. La crème est là si vous changez d'avis — bonne journée.",
            why: "Vous respectez le choix du client, laissez la porte ouverte sans insistance et concluez agréablement.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Dommage, c'est vraiment efficace pour l'hiver.",
            why: "Insister après un refus clair peut mettre le client mal à l'aise et donne une impression de pression commerciale.",
            quality: "poor",
          },
          {
            id: "c",
            text: "D'accord. Vous êtes sûr ? Elle est en promotion.",
            why: "Utiliser une promotion pour relancer après un refus est une forme de pression. Accepter le choix est plus respectueux.",
            quality: "poor",
          },
        ],
        correct: "a",
      },
    ],
  },
  {
    id: "besoin_flou",
    title: "Une demande imprécise",
    badge: "CLARIFICATION NÉCESSAIRE",
    badgeTone: "amber",
    context:
      "Le client ne sait pas exactement ce qu'il cherche. Une question ouverte est nécessaire avant toute suggestion.",
    relatedLesson: "decouvrir_besoin",
    steps: [
      {
        id: "besoin_flou_1",
        title: "Identifier le besoin",
        situation:
          "Une cliente entre et dit : « Bonjour, j'aurais besoin de... je ne sais pas trop en fait. Quelque chose pour me sentir mieux en ce moment. »",
        answers: [
          {
            id: "a",
            text: "On a des compléments multivitaminés très bien pour se sentir mieux — je vous montre ?",
            why: "Proposer un produit avant de comprendre la situation risque de passer à côté du vrai besoin.",
            quality: "poor",
          },
          {
            id: "b",
            text: "Bien sûr. Qu'est-ce qui vous amène aujourd'hui — est-ce que vous pouvez me dire ce qui ne va pas ?",
            why: "Une question ouverte invite la cliente à s'exprimer et vous donne les informations nécessaires pour l'aider.",
            quality: "recommended",
          },
          {
            id: "c",
            text: "Vous avez une ordonnance ?",
            why: "Cette question ferme l'échange sur une piste médicale alors que vous n'avez pas encore compris ce que la cliente ressent.",
            quality: "poor",
          },
        ],
        correct: "b",
      },
      {
        id: "besoin_flou_2",
        title: "Approfondir avec une seule question",
        situation:
          "La cliente répond : « Je suis fatiguée depuis quelques semaines — pas malade, juste à plat. »",
        answers: [
          {
            id: "a",
            text: "Est-ce que vous dormez bien, vous mangez équilibré, et vous faites du sport ?",
            why: "Trois questions d'un coup sont difficiles à traiter. Posez une seule question précise pour avancer.",
            quality: "poor",
          },
          {
            id: "b",
            text: "C'est surtout en journée ou le matin aussi ?",
            why: "Une question ciblée sur le moment de la fatigue vous aide à mieux orienter votre suggestion.",
            quality: "recommended",
          },
          {
            id: "c",
            text: "Je vais vous montrer notre rayon bien-être.",
            why: "Montrer un rayon avant d'avoir cerné le besoin ne l'aide pas et peut la laisser plus confuse.",
            quality: "poor",
          },
        ],
        correct: "b",
      },
      {
        id: "besoin_flou_3",
        title: "Proposer ou orienter",
        situation:
          "La cliente dit : « Surtout en milieu de journée. Je n'ai aucun problème de santé particulier, je n'ai juste plus d'énergie. »",
        answers: [
          {
            id: "a",
            text: "Dans ce cas, un complément en magnésium peut correspondre à ce que vous décrivez — mais si ça dure, consultez un médecin.",
            why: "Vous proposez une option parapharmacie en lien avec ce qu'elle a exprimé, tout en limitant clairement votre rôle.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Il faudrait voir un médecin pour une fatigue qui dure des semaines.",
            why: "Orienter vers un médecin est parfois utile, mais ici la cliente a précisé qu'elle n'a pas de problème de santé — une option parapharmacie est adaptée.",
            quality: "acceptable",
          },
          {
            id: "c",
            text: "On a un booster énergie très populaire, testé et approuvé par beaucoup de clients.",
            why: "Des affirmations comme « testé et approuvé » sans source précise sont à éviter — elles peuvent induire en erreur.",
            quality: "poor",
          },
        ],
        correct: "a",
      },
    ],
  },
  {
    id: "medication_concern",
    title: "Une question sur un médicament",
    badge: "ORIENTATION PHARMACIEN",
    badgeTone: "purple",
    context:
      "Le client pose une question qui implique un médicament ou une interaction. Ce type de question doit être transmis au pharmacien.",
    relatedLesson: "gerer_incertitude",
    steps: [
      {
        id: "medication_concern_1",
        title: "Reconnaître la limite",
        situation:
          "Un client dit : « On m'a prescrit un sirop pour la toux. Est-ce que je peux le prendre en même temps que mon traitement pour la tension ? »",
        answers: [
          {
            id: "a",
            text: "En général les sirops pour la toux sont sans problème, ne vous inquiétez pas.",
            why: "Les interactions dépendent des composants exacts — donner une assurance générale peut être risqué.",
            quality: "poor",
          },
          {
            id: "b",
            text: "C'est une question importante. Je vais vous orienter vers notre pharmacien qui pourra vous répondre avec précision.",
            why: "Vous reconnaissez la limite de votre rôle et transmettez la question à la bonne personne, sans inventer une réponse.",
            quality: "recommended",
          },
          {
            id: "c",
            text: "Lisez la notice, les interactions sont indiquées dedans.",
            why: "La notice peut être incomplète ou difficile à interpréter sans formation. Le pharmacien est la bonne référence pour ce type de question.",
            quality: "acceptable",
          },
        ],
        correct: "b",
      },
      {
        id: "medication_concern_2",
        title: "Préparer la transmission",
        situation:
          "Vous avez orienté le client vers le pharmacien. Comment transmettez-vous la situation ?",
        answers: [
          {
            id: "a",
            text: "« Il a une question. » (et vous laissez le client expliquer seul)",
            why: "Une courte transmission réduit la répétition pour le client et aide le pharmacien à cerner rapidement la situation.",
            quality: "poor",
          },
          {
            id: "b",
            text: "« Ce client souhaite savoir si son sirop pour la toux est compatible avec son traitement pour la tension. »",
            why: "Un résumé court et précis permet un transfert fluide — le client n'a pas à tout répéter.",
            quality: "recommended",
          },
          {
            id: "c",
            text: "Vous attendez que le pharmacien soit disponible sans rien dire.",
            why: "Sans introduction, le transfert est discontinu et le client peut se sentir abandonné.",
            quality: "poor",
          },
        ],
        correct: "b",
      },
      {
        id: "medication_concern_3",
        title: "Clore sans conseil clinique",
        situation:
          "Après que le pharmacien a répondu, le client vous dit : « Merci, le pharmacien m'a dit que c'est compatible. Je voudrais aussi quelque chose pour le nez bouché. »",
        answers: [
          {
            id: "a",
            text: "Pour le nez, il yaudrait voir avec le pharmacien aussi, vu votre traitement.",
            why: "Ici la demande est un produit nasal courant — mais avec un traitement pour la tension en cours, le mieux est d'impliquer à nouveau le pharmacien.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "On a un spray nasal à base d'eau de mer, simple et sans médicament — je vous le montre.",
            why: "Un spray eau de mer est anodin, mais avec un traitement pour la tension, même un décongestionnant doux mérite une vérification. Recommander une vérification est plus prudent.",
            quality: "acceptable",
          },
          {
            id: "c",
            text: "Pour le nez, je vous prends le décongestionnant le plus efficace.",
            why: "Certains décongestionnants sont contre-indiqués avec des traitements pour la tension. Proposer « le plus efficace » sans vérification peut être risqué.",
            quality: "poor",
          },
        ],
        correct: "a",
      },
    ],
  },
  {
    id: "no_purchase",
    title: "Aucun achat complémentaire indiqué",
    badge: "AUCUN ACHAT NÉCESSAIRE",
    badgeTone: "green",
    context:
      "La situation du client montre qu'aucun produit supplémentaire n'est justifié. Reconnaître et accepter cela est une réponse professionnelle.",
    relatedLesson: "option_complementaire",
    steps: [
      {
        id: "no_purchase_1",
        title: "Évaluer la situation",
        situation:
          "Une cliente dit : « J'ai pris le spray nasal que vous m'avez conseillé la semaine dernière. Ça va beaucoup mieux ! Je voulais juste savoir si je dois continuer ou si je peux m'arrêter. »",
        answers: [
          {
            id: "a",
            text: "Si ça va mieux, vous pouvez vous arrêter — les sprays eau de mer n'ont pas besoin d'être pris en continu quand les symptômes sont passés.",
            why: "Vous donnez une réponse honnête sur un produit courant, sans inciter à poursuivre inutilement.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Je vous conseille de continuer encore une semaine pour consolider.",
            why: "Sans raison précise, conseiller de prolonger un traitement peut encourager une dépendance inutile à un produit.",
            quality: "poor",
          },
          {
            id: "c",
            text: "Vous pourriez aussi prendre un complément pour renforcer les défenses — c'est la bonne période.",
            why: "La cliente n'a pas exprimé ce besoin. Proposer un produit supplémentaire ici n'est pas justifié par sa situation.",
            quality: "poor",
          },
        ],
        correct: "a",
      },
      {
        id: "no_purchase_2",
        title: "Ne rien proposer si rien n'est indiqué",
        situation:
          "La cliente dit : « Super, merci. Je n'ai pas d'autre souci pour le moment. » Elle se dirige vers la sortie.",
        answers: [
          {
            id: "a",
            text: "Parfait. Bonne journée !",
            why: "L'échange est complet. Conclure simplement et chaleureusement est la bonne réponse — aucun achat n'est nécessaire.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Avant de partir, jetez un œil à notre rayon promo — on a des offres intéressantes.",
            why: "Rediriger vers les promotions en fin d'échange sans besoin exprimé donne une impression commerciale inappropriée.",
            quality: "poor",
          },
          {
            id: "c",
            text: "Et pour votre peau en hiver, vous pensez à bien l'hydrater ?",
            why: "Cette suggestion sans lien avec la demande de la cliente n'est pas justifiée et peut sembler opportuniste.",
            quality: "poor",
          },
        ],
        correct: "a",
      },
      {
        id: "no_purchase_3",
        title: "Reconnaître une fin d'échange réussie",
        situation:
          "La cliente revient deux jours plus tard et dit : « Je suis passée vous remercier — ça fait du bien d'être bien conseillée sans qu'on essaie de tout vendre. »",
        answers: [
          {
            id: "a",
            text: "Merci, c'est vraiment agréable à entendre. On essaie de comprendre votre besoin avant tout.",
            why: "Vous accueillez le compliment simplement en réaffirmant votre approche — c'est honnête et cohérent.",
            quality: "recommended",
          },
          {
            id: "b",
            text: "Merci ! D'ailleurs si vous avez besoin d'autre chose, on a une promotion ce mois-ci.",
            why: "Profiter du compliment pour placer une promotion annule le message positif de l'échange précédent.",
            quality: "poor",
          },
          {
            id: "c",
            text: "Oh je fais juste mon travail.",
            why: "Minimiser l'échange n'invite pas la personne à revenir. Reconnaître simplement sa satisfaction est mieux.",
            quality: "acceptable",
          },
        ],
        correct: "a",
      },
    ],
  },
];
