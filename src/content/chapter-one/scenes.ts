import { Chapter } from "../../domain/story/types";
export const chapterOne: Chapter = {
  id: "chapter-one",
  title: "The First Warning",
  contentVersion: 1,
  start: "c01-opening",
  flags: {
    route: ["woodland", "river"],
    warned: ["dre-kaar", "saerenn"],
    closing: ["together", "cautious"],
  },
  scenes: [
    {
      id: "c01-opening",
      lines: [
        {
          text: "Behind you, the Council's domes disappear among the trees. Ahead, the road follows a river toward Broken Bridge. By nightfall, the company must know whether the crossing is safe.",
        },
        {
          text: "We can debate the road until supper. But supper travels with me.",
          speaker: "dre-kaar",
        },
        {
          text: "Something has crossed the river ahead of us. My fox can find it.",
          speaker: "narion",
        },
        {
          text: "Then let us agree how to listen before everyone starts shouting.",
          speaker: "elvir",
        },
      ],
      questions: [
        {
          id: "fox",
          text: "Ask Narion about the fox",
          reply: {
            text: "He sees what I cannot. That does not mean he cannot be frightened.",
            speaker: "narion",
          },
        },
        {
          id: "raven",
          text: "Ask Elvir about the raven",
          reply: {
            text: "A warning is useful only when it reaches someone who can act.",
            speaker: "elvir",
          },
        },
        {
          id: "supper",
          text: "Ask Dre’Kaar about supper",
          reply: {
            text: "First survive the road. Then complain about the seasoning.",
            speaker: "dre-kaar",
          },
        },
      ],
      next: "c01-route",
    },
    {
      id: "c01-route",
      lines: [
        {
          text: "Scout the ground near Broken Bridge.",
        },
      ],
      choices: [
        {
          id: "woodland",
          text: "Follow the tree cover.",
          target: "c01-woodland",
          effects: {
            route: "woodland",
          },
        },
        {
          id: "river",
          text: "Follow the river overlook.",
          target: "c01-river",
          effects: {
            route: "river",
          },
        },
      ],
    },
    {
      id: "c01-woodland",
      lines: [
        {
          text: "Under the branches, you find grass pressed flat beside the road. Something waited here.",
        },
        {
          text: "Cover for us. Cover for them, too.",
          speaker: "narion",
        },
      ],
      next: "c01-fox",
    },
    {
      id: "c01-river",
      lines: [
        {
          text: "From the bank, you see loose stones falling near the broken span. The water hides whatever moves below.",
        },
        {
          text: "We can see the crossing. We cannot see its feet.",
          speaker: "narion",
        },
      ],
      next: "c01-fox",
    },
    {
      id: "c01-fox",
      assetId: "scene-fox",
      lines: [
        {
          text: "Narion lays out the bracelets. His fox slips between the roots.",
        },
        {
          text: "Wear one, and you will see what he sees. You must each decide what to do with it.",
          speaker: "narion",
        },
        {
          text: "Does he also smell supper?",
          speaker: "dre-kaar",
        },
        {
          text: "Unfortunately for you.",
          speaker: "narion",
        },
      ],
      puzzleId: "fox-vision",
      next: "c01-warning",
    },
    {
      id: "c01-warning",
      lines: [
        {
          text: "The shared vision shows movement behind the trees beside the road.",
          when: {
            flag: "route",
            equals: "woodland",
          },
        },
        {
          text: "The shared vision shows movement below the damaged crossing.",
          when: {
            flag: "route",
            equals: "river",
          },
        },
      ],
      choices: [
        {
          id: "dre-kaar",
          text: "Dre’Kaar: Keep everyone together.",
          target: "c01-raven",
          effects: {
            warned: "dre-kaar",
          },
        },
        {
          id: "saerenn",
          text: "Saerenn: Find somewhere sheltered.",
          target: "c01-raven",
          effects: {
            warned: "saerenn",
          },
        },
      ],
    },
    {
      id: "c01-raven",
      assetId: "scene-raven",
      lines: [
        {
          text: "Movement erupts beside the path. The company scatters. Voices overlap; no one can tell who needs help. Elvir raises his arm, and the raven takes flight.",
        },
        {
          text: "Stay close! I heard the warning. Nobody runs alone.",
          speaker: "dre-kaar",
          when: {
            flag: "warned",
            equals: "dre-kaar",
          },
        },
        {
          text: "This way. There is shelter behind these roots.",
          speaker: "saerenn",
          when: {
            flag: "warned",
            equals: "saerenn",
          },
        },
        {
          text: "Tell the raven what you need. Let it find the one who can answer.",
          speaker: "elvir",
        },
      ],
      puzzleId: "raven-coordination",
      next: "c01-camp",
    },
    {
      id: "c01-camp",
      assetId: "scene-camp",
      lines: [
        {
          text: "The company gathers on safe ground near Broken Bridge. The river carries the last light beneath the ruined span. Dre’Kaar tends a pot while Faelina and Latve argue over the herbs.",
        },
        {
          text: "Meat into cold water. Seasoning next. The order matters. The seasoning is where you can argue.",
          speaker: "dre-kaar",
        },
        {
          text: "Then you have left us very little freedom.",
          speaker: "latve",
        },
        {
          text: "Enough to improve the soup.",
          speaker: "faelina",
        },
        {
          text: "You trusted me to hold us together. Next time, give me the warning before the fox has to.",
          speaker: "dre-kaar",
          when: {
            flag: "warned",
            equals: "dre-kaar",
          },
        },
        {
          text: "A safe place is easier to find before someone needs healing. Thank you.",
          speaker: "saerenn",
          when: {
            flag: "warned",
            equals: "saerenn",
          },
        },
      ],
      choices: [
        {
          id: "together",
          text: "Tomorrow we cross together.",
          target: "c01-end",
          effects: {
            closing: "together",
          },
        },
        {
          id: "cautious",
          text: "Tomorrow we scout again.",
          target: "c01-end",
          effects: {
            closing: "cautious",
          },
        },
      ],
    },
    {
      id: "c01-end",
      lines: [
        {
          text: "Tomorrow, we find out what lies beyond the bridge.",
          speaker: "narion",
        },
        {
          text: "For tonight, there is warm food, dry ground, and someone keeping watch.",
        },
      ],
      terminal: true,
    },
  ],
};
