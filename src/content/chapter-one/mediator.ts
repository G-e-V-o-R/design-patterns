import { Blueprint } from "../../domain/blueprints/types";
export const mediator: Blueprint = {
  id: "raven-coordination",
  pattern: "Mediator",
  roles: [
    {
      id: "raven",
      label: "Raven",
      assetId: "card-raven",
    },
    {
      id: "narion",
      label: "Narion",
      characterId: "narion",
      assetId: "narion-mediatorCard",
    },
    {
      id: "elvir",
      label: "Elvir",
      characterId: "elvir",
      assetId: "elvir-mediatorCard",
    },
    {
      id: "dre-kaar",
      label: "Dre’Kaar",
      characterId: "dre-kaar",
      assetId: "dre-kaar-mediatorCard",
    },
    {
      id: "faelina",
      label: "Faelina",
      characterId: "faelina",
      assetId: "faelina-mediatorCard",
    },
    {
      id: "latve",
      label: "Latve",
      characterId: "latve",
      assetId: "latve-mediatorCard",
    },
    {
      id: "saerenn",
      label: "Saerenn",
      characterId: "saerenn",
      assetId: "saerenn-mediatorCard",
    },
    {
      id: "jararis",
      label: "Jararis",
      characterId: "jararis",
      assetId: "jararis-mediatorCard",
    },
  ],
  edgeTypes: ["requests", "delivers"],
  solution: {
    roles: [
      "raven",
      "narion",
      "elvir",
      "dre-kaar",
      "faelina",
      "latve",
      "saerenn",
      "jararis",
    ],
    edges: [
      {
        source: "narion",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "narion",
        type: "delivers",
      },
      {
        source: "elvir",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "elvir",
        type: "delivers",
      },
      {
        source: "dre-kaar",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "dre-kaar",
        type: "delivers",
      },
      {
        source: "faelina",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "faelina",
        type: "delivers",
      },
      {
        source: "latve",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "latve",
        type: "delivers",
      },
      {
        source: "saerenn",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "saerenn",
        type: "delivers",
      },
      {
        source: "jararis",
        target: "raven",
        type: "requests",
      },
      {
        source: "raven",
        target: "jararis",
        type: "delivers",
      },
    ],
  },
  hints: [
    "Who can hear everyone?",
    "Send requests through Elvir’s raven.",
    "Find a missing request or delivery.",
  ],
  explanation:
    "The raven coordinates requests for particular recipients. Companions do not communicate directly.",
  simulations: [
    {
      id: "cover",
      input: "cover",
      path: [
        {
          source: "dre-kaar",
          target: "raven",
          type: "requests",
        },
        {
          source: "raven",
          target: "narion",
          type: "delivers",
        },
      ],
      recipients: ["narion"],
    },
    {
      id: "shelter",
      input: "shelter",
      path: [
        {
          source: "faelina",
          target: "raven",
          type: "requests",
        },
        {
          source: "raven",
          target: "saerenn",
          type: "delivers",
        },
      ],
      recipients: ["saerenn"],
    },
  ],
};
