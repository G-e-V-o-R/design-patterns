import { assets } from "../content/assets";
import asset0 from "../../docs/hobbit/UML/1.1.png?url";
import asset1 from "../../docs/hobbit/UML/1.2.png?url";
import asset2 from "../../docs/hobbit/UML/1.3.png?url";
import asset3 from "../../docs/hobbit/UML/1.4.png?url";
import asset4 from "../../docs/hobbit/UML/1.5.png?url";
import asset5 from "../../docs/hobbit/UML/1.6.png?url";
import asset6 from "../../docs/hobbit/UML/1.7.png?url";
import asset7 from "../../docs/hobbit/UML/1.8.png?url";
import asset8 from "../../docs/hobbit/UML/2.1.png?url";
import asset9 from "../../docs/hobbit/UML/2.2.png?url";
import asset10 from "../../docs/hobbit/UML/2.3.png?url";
import asset11 from "../../docs/hobbit/UML/2.4.png?url";
import asset12 from "../../docs/hobbit/UML/2.5.png?url";
import asset13 from "../../docs/hobbit/UML/2.6.png?url";
import asset14 from "../../docs/hobbit/UML/2.7.png?url";
import asset15 from "../../docs/hobbit/UML/2.8.png?url";
import asset16 from "../../docs/hobbit/heroes/elf/DRE.png?url";
import asset17 from "../../docs/hobbit/heroes/elf/Elbir.png?url";
import asset18 from "../../docs/hobbit/heroes/elf/Faelina.png?url";
import asset19 from "../../docs/hobbit/heroes/elf/Jararis.png?url";
import asset20 from "../../docs/hobbit/heroes/elf/Latve.png?url";
import asset21 from "../../docs/hobbit/heroes/elf/Narion.png?url";
import asset22 from "../../docs/hobbit/heroes/elf/Saerenn.png?url";
import asset23 from "../../docs/hobbit/scenarios/1.1.png?url";
import asset24 from "../../docs/hobbit/scenarios/2.2.png?url";
import asset25 from "../../docs/hobbit/scenarios/6.png?url";
import asset26 from "../../docs/map.jpg?url";
const urls: Record<string,string> = {
  "docs/hobbit/UML/1.1.png": asset0,
  "docs/hobbit/UML/1.2.png": asset1,
  "docs/hobbit/UML/1.3.png": asset2,
  "docs/hobbit/UML/1.4.png": asset3,
  "docs/hobbit/UML/1.5.png": asset4,
  "docs/hobbit/UML/1.6.png": asset5,
  "docs/hobbit/UML/1.7.png": asset6,
  "docs/hobbit/UML/1.8.png": asset7,
  "docs/hobbit/UML/2.1.png": asset8,
  "docs/hobbit/UML/2.2.png": asset9,
  "docs/hobbit/UML/2.3.png": asset10,
  "docs/hobbit/UML/2.4.png": asset11,
  "docs/hobbit/UML/2.5.png": asset12,
  "docs/hobbit/UML/2.6.png": asset13,
  "docs/hobbit/UML/2.7.png": asset14,
  "docs/hobbit/UML/2.8.png": asset15,
  "docs/hobbit/heroes/elf/DRE.png": asset16,
  "docs/hobbit/heroes/elf/Elbir.png": asset17,
  "docs/hobbit/heroes/elf/Faelina.png": asset18,
  "docs/hobbit/heroes/elf/Jararis.png": asset19,
  "docs/hobbit/heroes/elf/Latve.png": asset20,
  "docs/hobbit/heroes/elf/Narion.png": asset21,
  "docs/hobbit/heroes/elf/Saerenn.png": asset22,
  "docs/hobbit/scenarios/1.1.png": asset23,
  "docs/hobbit/scenarios/2.2.png": asset24,
  "docs/hobbit/scenarios/6.png": asset25,
  "docs/map.jpg": asset26,
};
export function assetUrl(id: string): string {
 const asset = assets.find(a => a.id === id);
 if (!asset || !urls[asset.sourcePath]) throw new Error("Unknown artwork: " + id);
 return urls[asset.sourcePath]!;
}
