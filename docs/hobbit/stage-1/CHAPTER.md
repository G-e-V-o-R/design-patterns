# Chapter 01: The First Warning

English adaptation with newly authored connective dialogue. Sources: Russian scenes 1, 2, and 6. All prose below is a proposed playable script, not a literal translation. Goal: find a safe approach to Broken Bridge and bring every companion to camp before dark.

## c01-opening — Council of the Seven outskirts

Narration: Behind you, the Council's domes disappear among the trees. Ahead, the road follows a river toward Broken Bridge. By nightfall, the company must know whether the crossing is safe.

Dre’Kaar: “We can debate the road until supper. But supper travels with me.”
Narion: “Something has crossed the river ahead of us. My fox can find it.”
Elvir: “Then let us agree how to listen before everyone starts shouting.”

Optional questions, each usable once:
- Ask Narion about the fox → “He sees what I cannot. That does not mean he cannot be frightened.”
- Ask Elvir about the raven → “A warning is useful only when it reaches someone who can act.”
- Ask Dre’Kaar about supper → “First survive the road. Then complain about the seasoning.”

Continue → c01-route. No new characters appear at the Council.

## c01-route — choose the approach

Map objective: Scout the ground near Broken Bridge.
- Follow the tree cover. Set route=woodland → c01-woodland.
- Follow the river overlook. Set route=river → c01-river.

c01-woodland: Narration: Under the branches, you find grass pressed flat beside the road. Something waited here. Narion: “Cover for us. Cover for them, too.” Continue → c01-fox.

c01-river: Narration: From the bank, you see loose stones falling near the broken span. The water hides whatever moves below. Narion: “We can see the crossing. We cannot see its feet.” Continue → c01-fox.

## c01-fox — source scene 1

Narration: Narion lays out the bracelets. His fox slips between the roots.
Narion: “Wear one, and you will see what he sees. You must each decide what to do with it.”
Dre’Kaar: “Does he also smell supper?”
Narion: “Unfortunately for you.”

Open puzzle fox-vision. On completion or assisted completion → c01-warning. Journal: one discovery can reach several listeners without choosing their responses.

## c01-warning — an actual consequence

If woodland: The shared vision shows movement behind the trees beside the road.
If river: The shared vision shows movement below the damaged crossing.

Choose whom to warn first:
- Dre’Kaar: “Keep everyone together.” Set warned=dre-kaar.
- Saerenn: “Find somewhere sheltered.” Set warned=saerenn.

Both choices → c01-raven. This is a tactical preference, not a morally correct answer.

## c01-raven — source scene 2

Narration: Movement erupts beside the path. The company scatters. Voices overlap; no one can tell who needs help. Elvir raises his arm, and the raven takes flight.
If warned=dre-kaar: Dre’Kaar: “Stay close! I heard the warning. Nobody runs alone.”
If warned=saerenn: Saerenn: “This way. There is shelter behind these roots.”
Elvir: “Tell the raven what you need. Let it find the one who can answer.”

Open puzzle raven-coordination. The graph routes a request for cover to Narion and a request for shelter to Saerenn. The encounter ends through illustrated movement and narration, with no new named or speaking enemy. Completion or assisted completion → c01-camp.

## c01-camp — source scene 6

Narration: The company gathers on safe ground near Broken Bridge. The river carries the last light beneath the ruined span. Dre’Kaar tends a pot while Faelina and Latve argue over the herbs.
Dre’Kaar: “Meat into cold water. Seasoning next. The order matters. The seasoning is where you can argue.”
Latve: “Then you have left us very little freedom.”
Faelina: “Enough to improve the soup.”

If warned=dre-kaar: Dre’Kaar: “You trusted me to hold us together. Next time, give me the warning before the fox has to.”
If warned=saerenn: Saerenn: “A safe place is easier to find before someone needs healing. Thank you.”

Choose a closing remark:
- “Tomorrow we cross together.” Set closing=together.
- “Tomorrow we scout again.” Set closing=cautious.

Narion: “Tomorrow, we find out what lies beyond the bridge.”
Narration: For tonight, there is warm food, dry ground, and someone keeping watch.

→ c01-end. Unlock chapter replay and journal; subsequent chapter remains marked Coming later. Record route, warned, closing, and puzzle assistance independently. Replaying a chapter uses a fresh chapter state and does not duplicate campaign rewards.
