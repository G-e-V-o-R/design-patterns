import { Blueprint } from "../../domain/blueprints/types";
export const observer: Blueprint = {
  id: "fox-vision",
  pattern: "Observer",
  roles: [
    {
      id: "fox",
      label: "Fox",
      assetId: "card-fox",
    },
    {
      id: "narion",
      label: "Narion",
      characterId: "narion",
      assetId: "narion-observerCard",
    },
    {
      id: "elvir",
      label: "Elvir",
      characterId: "elvir",
      assetId: "elvir-observerCard",
    },
    {
      id: "dre-kaar",
      label: "Dre’Kaar",
      characterId: "dre-kaar",
      assetId: "dre-kaar-observerCard",
    },
    {
      id: "faelina",
      label: "Faelina",
      characterId: "faelina",
      assetId: "faelina-observerCard",
    },
    {
      id: "latve",
      label: "Latve",
      characterId: "latve",
      assetId: "latve-observerCard",
    },
    {
      id: "saerenn",
      label: "Saerenn",
      characterId: "saerenn",
      assetId: "saerenn-observerCard",
    },
    {
      id: "jararis",
      label: "Jararis",
      characterId: "jararis",
      assetId: "jararis-observerCard",
    },
  ],
  edgeTypes: ["observes"],
  solution: {
    roles: [
      "fox",
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
        target: "fox",
        type: "observes",
      },
      {
        source: "elvir",
        target: "fox",
        type: "observes",
      },
      {
        source: "dre-kaar",
        target: "fox",
        type: "observes",
      },
      {
        source: "faelina",
        target: "fox",
        type: "observes",
      },
      {
        source: "latve",
        target: "fox",
        type: "observes",
      },
      {
        source: "saerenn",
        target: "fox",
        type: "observes",
      },
      {
        source: "jararis",
        target: "fox",
        type: "observes",
      },
    ],
  },
  hints: [
    "Who sees first?",
    "Each bracelet listens to the same fox.",
    "Find a companion without a subscription.",
  ],
  explanation:
    "Subscription arrows point to the fox; discoveries flow back to subscribers. Seven subscribers are required by this scene, not by the pattern.",
  simulations: [
    {
      id: "discovery",
      input: "Movement near the crossing",
      path: [
        {
          source: "narion",
          target: "fox",
          type: "observes",
        },
        {
          source: "elvir",
          target: "fox",
          type: "observes",
        },
        {
          source: "dre-kaar",
          target: "fox",
          type: "observes",
        },
        {
          source: "faelina",
          target: "fox",
          type: "observes",
        },
        {
          source: "latve",
          target: "fox",
          type: "observes",
        },
        {
          source: "saerenn",
          target: "fox",
          type: "observes",
        },
        {
          source: "jararis",
          target: "fox",
          type: "observes",
        },
      ],
      recipients: [
        "narion",
        "elvir",
        "dre-kaar",
        "faelina",
        "latve",
        "saerenn",
        "jararis",
      ],
    },
  ],
};
