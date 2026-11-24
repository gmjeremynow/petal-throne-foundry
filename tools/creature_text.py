"""
Creature descriptions for the compendium, rewritten in plain words from EPT 1975
Secs. 1126-1129 and 1221 (mechanics kept, wording our own).

Each entry: name -> dict with
  look     appearance
  play     behaviour and combat, in plain words
  sizes    optional (labels, chances %, hit dice) for creatures that come in sizes
  flags    optional overrides for the actor: noMorale, attacks, dmgBonus, hitBonus,
           acMagic (extra needed to hit it), damageDice, intelligent
  sec      section of the full entry
"""

C = {}

def add(name, sec, look, play, sizes=None, **flags):
    C[name] = {"sec": sec, "look": look, "play": play, "sizes": sizes, "flags": flags}

# ---------------- Flying beings (Sec. 1126)
add("Chólokh", "1126 (1)",
    "A six-legged insect-like flyer with brownish-grey chitin. Long, shimmering, gauzy wings fold away beneath a hard shell cover. Beside its strong mandibles it has eight small tentacles.",
    "It throws sharp rock fragments with its tentacles from 10-60 ft away (1d6 on a hit), then closes and strikes again in the same round, at the same or another victim. It always attacks and never checks morale.",
    noMorale=True, attacks=2)
add("Dlákolel", "1126 (2)",
    "A huge armoured flying beetle, 10-15 ft long, with six legs, heavy shiny wings, gleaming black chitin and gleaming black mandibles. Its armour has earned it the name \"Steed of Sárku.\"",
    "Somewhat intelligent; it may be friendly or neutral (roll reactions). Once it attacks or is attacked, it fights to the death. Its mandibles add +2 to the damage of every hit.",
    noMorale=True, dmgBonus=2)
add("Gerednyá", "1126 (3)",
    "Long, slender, greyish-green worms with thin, membrane-like wings, a stinging prehensile tail and a needle-sharp proboscis.",
    "Each round a Gerednyá strikes with its tail (60%; save against poison) or its proboscis (40%). Fire drives them off: 60% chance each round to drive away 1-6. Armourers pay 100 Káitars for each wing case, which holds a chemical used in moulding Chlén-hide.")
add("Gíriku", "1126 (4)",
    "Bluish-green nocturnal flying reptiles with long beaks lined with three rows of needle-pointed teeth and six eyes. They carry a musty odour that men find repellent.",
    "They see in the dark and get +2 to hit at night.")
add("Káyi", "1126 (5)",
    "A large floating gas bag carrying a single huge, bulging eye. Thin, fibrous tentacle nets hang beneath it.",
    "Káyi hang high in dark corners and drop their nets on those below: 75% to trap a victim, who then loses one experience level each round. A companion who cuts the victim loose in the first round (40% chance) spares the level drain, but the victim takes 2d6. Flaming arrows bring them down; swords seldom reach them, but a spear, pike or halberd can.")
add("Khéshchal", "1126 (6)",
    "Semi-intelligent birds covered in brilliant plumage, prized for feather capes and helmet crests.",
    "They usually flee (70%). A cornered Khéshchal can be subdued instead of killed by bringing its hit points to exactly 1 or 0; more damage kills it. Its feathers are worth 1d20 x 100 Káitars; a live, subdued bird is worth 1d20 x 200.")
add("Kýni", "1126 (7)",
    "Small brownish falcon-like birds of limited intelligence.",
    "Trained by a bird-trainer, a Kýni can speak and is useful as a hunter or spy, reporting troops and terrain to its master. Lure one down with aromatic Tsúral buds (50%) or bring it down with blunt, sticky arrows. It cannot fight and always tries to escape; if shot at, roll 1d6: 1-2 it escapes, 6 it is killed. Hit dice 1-3 means half a hit die, rounded up.")
add("Lrí", "1126 (8)",
    "Stilt-legged, insect-like flyers related to the Hlýss, with long segmented tails ending in a sting.",
    "The sting paralyses (save against paralysis). The Lrí tries to fly off with a paralysed victim (60%) to feed its young in its lair; the party has a 40% chance to find the lair. If the victim is not found within three moves, he is eaten and has only a 5% chance of revival. A rescued victim is cured by Heal Serious Wounds or an Eye of healing and needs two days before fighting again.")
add("Shánu'u", "1126 (9)",
    "Warm-blooded winged killers covered in greyish fur, 20-30 ft long including a long tufted tail. Larger, heavier cousins of the Hláka.",
    "50% chance it attacks humans, 50% that it just avoids them. A Hláka in the party has a 50% chance to control 1-6 Shánu'u for three combat rounds; this cannot be renewed.")
add("Teqéqmu", "1126 (10)",
    "A spongy, khaki-coloured, shapeless bag of noxious gas that drifts on the wind over mountains, forests and swamps, with a whip-like central tentacle.",
    "It drops onto its prey. Each round, 70% it releases poison gas over 1-6 beings (save against poison), 30% it lashes with its tentacle. A downed Teqéqmu regenerates within 3 turns unless it is thoroughly burned.",
    sizes=(["small", "medium", "large"], [40, 40, 20], ["6", "8", "10"]))
add("Vorodlá", "1126 (11)",
    "Dingy, blackish undead with huge leathery wings: the reanimated and reshaped bodies of ancient warriors set to defend the citadels of Ksárul. They haunt old tombs and ruins and nest in caves.",
    "They fight like zombies until cut apart and never check morale. +2 to hit at night. Each hit has a 20% chance to drain one experience level. The body must be burned or it regenerates within 2 turns.",
    noMorale=True)
add("Vringálu", "1126 (12)",
    "Ropy, blue-black, feathered flying snakes with leathery wings.",
    "They attack viciously and never check morale. A bite causes a rotting gangrene that kills unless Tsúral buds or Cure Disease are applied within three turns. The poison is dangerous even to touch. Tanners pay 100 Káitars per wing for its fine leather.",
    noMorale=True)

# ---------------- Nonhuman races (Sec. 1127)
add("Ahoggyá", "1127 (1)",
    "Knobbly, brownish, bristly beings 4-5 ft tall but enormously broad and strong. Four powerful arms rise from the top of the body; the eyes and mouth sit beneath them inside a horny protective ring. They stand on four thick, muscular legs.",
    "A once-proud interstellar species, now living mostly in swampy colonies in southern Salarvyá and across the straits in Háida Pakála. Highly intelligent; they speak human tongues with a dreadful accent. Neutral and wanting to be left alone, they rarely help men and never gladly (ignore friendly reaction rolls of 71-100 and reroll). They use all ordinary and magical weapons, preferring a jagged curved sword, a halberd or a composite bow. Sleep does not affect them and hypnosis does little.",
    intelligent=True)
add("Hláka", "1127 (2)",
    "Intelligent flyers with leathery wings and greyish fur, flattish heads, and three eyes with nictitating membranes set in a bony crest. A furred ruff hides their ears. They have two arms, two legs and a tail ending in a poisoned, rapier-like blade.",
    "Mountain dwellers east of Tsolyánu, of an ancient interstellar race. Each round they strike twice: weapons (sword, light javelin or crossbow) and tail (save against poison when stung). They are skittish: at the start of each round they must roll 1-60 to stay (1-75 if a party member died last round, 1-85 if a Hláka died); failures fly off, rolling 1-60 each turn to return. Neutral to men; a friendly reaction must be confirmed with 1-60. They make good scouts, aerial archers and rock-droppers (up to 10 lb), but dread ships and may die of fright aboard. Parties outside their land have 1-3 Priests or Magic Users per 10.",
    attacks=2, intelligent=True)
add("Hlutrgú", "1127 (3)",
    "Rubbery, four-legged swamp beings with skull-like heads, wide fanged mouths, and four long arms.",
    "They hate humans and other nonhumans alike and attack without checking morale, spearing or throwing darts. Men have long fought to keep them to their own swamps, but raiding parties and pirate ships still emerge. They are infamous for torturing captives.",
    noMorale=True, intelligent=True)
add("Hlýss", "1127 (4)",
    "Insect-like remnants of the world before men: six legs, light chitin armour, and a row of razor-sharp mandibles beneath a proboscis. The tail carries a paralysing sting. They set captured gems and jewellery permanently into their body armour, so high-ranking Hlýss glitter with jewels.",
    "Two attacks a round: a hand weapon (often a jagged sword shaped like a lightning bolt) and the sting (save against poison or be paralysed and carried off to feed the Hlýss Mother and her young). They live on their island and in hive-like ships grown from a stony secretion. Any party includes one Hlýss of levels II-XII with magical weapons and Eyes; 50% chance the rest are fighters of levels II-XII. Friendly to the Ssú, sometimes neutral to the Hláka. Their horrible appearance means fighters of levels I-IV need +1 to hit them.",
    attacks=2, intelligent=True)
add("Páchi Léi", "1127 (5)",
    "Doughy-looking forest beings with eight jointed limbs: the front four for eating and fighting, the other four for moving and balancing in the trees. Huge platter-shaped eyes give them night vision.",
    "They live along the forested coasts of western Tsolyánu and eastern Mu'ugalavyá and use all weapons and magical devices easily. Usually indifferent to humans but sometimes friendly (+10 toward friendly reactions). They notice secret doors and passages as they pass on 1-4 on 1d6. Many have become citizens of human nations, and history records Páchi Léi generals of human troops. Hyahyú'u flee from them.",
    intelligent=True)
add("Pé Chói", "1127 (6)",
    "Slender, stick-like beings of black chitin about seven feet tall, with six limbs, fan-like ear growths and a long, jutting mandible-jaw.",
    "Friendly to humans. Their wide hearing and sight detect invisible or silent creatures within 200 ft (60%). They find secret doors and traps automatically if they search for a turn, notice secret doors in passing on 1-2 on 1d6, and on a 6 can sense the thoughts in a neighbouring room. They fight with jag-edged swords and spears and can use maces and bows. Racial telepathy tells them when one of their kind is killed, and they never forgive it. They often serve in human armies.",
    intelligent=True)
add("Pygmy Folk", "1127 (7)",
    "Small rodent-like people about three feet tall, with sharp little faces, large round ears, glittering black eyes and three-fingered hands.",
    "They hear through walls and doors automatically and see in pitch darkness. Capricious but friendly to men. With ordinary weapons they get -1 to hit and -1 damage because of their size. Once attacked they are ferocious and never check morale. Their home lies far to the south and east of Tsolyánu, but they travel and trade widely and drive famously hard bargains.",
    noMorale=True, hitBonus=-1, dmgBonus=-1, intelligent=True)
add("Shén", "1127 (8)",
    "Tall, dragon-like beings with gleaming black scales that look like demonic warriors in fantastic plate armour. They have long beak-like snouts and a glittering crest of slender spines that can be raised or laid flat, often capped with metal like a helmet. They walk upright on two legs, with two arms and a muscular tail ending in a mace-like horny knob.",
    "An imported interstellar race living in the hot volcanic lands south of Livyánu. Each round, 70% they strike with weapons (curved jagged swords, spears, halberds, bows) and 30% with the tail, which does 1d4 with no damage bonus (corrigenda). A Shén of low Dexterity may lash a companion by accident in battle-rage. Neutral to slightly hostile to men, but will help a party for a price. Keep Ahoggyá well away from them.",
    intelligent=True)
add("Shunned Ones", "1127 (9)",
    "Tall, ragged, spectral beings, roughly human in shape but with very long arms and legs. They give off an overpowering stench.",
    "An extremely ancient race, perhaps older than the Ssú, living in sealed cities in the foothills of Yán Kór's mountains. They leave only to hunt magical items in the labyrinths under ruined cities. 60% of parties include a Magic User of levels V-X with Eyes and bonus spells. Humans smell them at 200 ft; nonplayer humans must then check morale or flee.",
    intelligent=True)
add("Ssú", "1127 (10)",
    "Tall, slender, six-limbed beings wrapped in what look like greyish shrouds (really a loose skin that keeps shredding away). They smell of musty cinnamon and make a high, sweet chiming sound.",
    "Ancient and deadly enemies of mankind, whom they blame for destroying the original Tékumel. They live north of Salarvyá and long to retake their old fortress of Ssuganár. Every Ssú met outside its land has one priestly and one magic user skill (roll which); every party of 10+ has a Magic User of levels IV-XV. Ssú of level IV+ can hypnotise 1-3 persons once a day (20% chance each round; save or fight for the Ssú until it dies). Friendly to the Hlýss, sometimes to the Hláka, neutral to the Shunned Ones. They are said to cross human borders by lost ancient tunnels.",
    intelligent=True)
add("Swamp Folk", "1127 (11)",
    "Squat, round, rubbery white beings 4-6 ft tall with six limbs. A bony crest rises from a long sloping forehead and sweeps back to a point, and a flap of skin hangs from it over the shoulders and upper back.",
    "They live in the swamps of the lower Putuhénu River in southern Mu'ugalavyá. Friendly to men (ignore reaction rolls of 1-20). They use no magic, but sense sloping passages, traps and dimensional nexus points (80%). They avoid fighting, but are fine sailors and often crew Mu'ugalavyáni ships.",
    intelligent=True)
add("Tinalíya", "1127 (12)",
    "Tiny humanoids about two feet tall, covered in horny skin, with a pair of long bony arms and four legs.",
    "Scholars: a lair holds at least one magical book (40% for 1-3 more), 1-6 scrolls and 2-12 Eyes. Friendly to humans (ignore reaction rolls of 1-20); they join an expedition only on a 6 on 1d6, and on 12 on 2d6 will give the party a book or scroll of spells they carry. If attacked they fight fiercely, never check morale, and use poisoned swords and arrows (save against poison). Hypnosis has little effect on them.",
    noMorale=True, intelligent=True)

# ---------------- Animals (Sec. 1128)
add("Chlén", "1128 (1)",
    "Huge, slow, six-legged beasts with flattish horned heads and a splayed beak, covered in a thick horny hide.",
    "It fights only if attacked. Brought to exactly 1 or 0 hit points, it is subdued and an animal trainer can domesticate it. Its hide, cut from the living animal and regrown in two weeks, is processed into Chlén-hide, the near-iron material of most arms and armour on Tékumel. Tamed Chlén pull carts slowly.")
add("Chnélh", "1128 (2)",
    "Mutants bred from Earth ape stock by the Priests of Ksárul: roughly human-shaped, with long sharp jaws and teeth, a vestigial nose, and large jewel-like round eyes under heavy brows.",
    "Semi-intelligent but untrainable. They attack parties they outnumber and run from parties as strong or stronger. They fight with clubs and spears. 10% chance each carries 1 Káitar.")
add("Dnélu", "1128 (3)",
    "Hairy, six-legged ambushers with slender rod-like antennae and a barbed, prehensile tongue.",
    "They dig dens hidden under a thin layer of grass or sod and leap out at travellers, trying to drag a victim down to eat at leisure. Only 15% chance they attack a party of more than 6. They hoard bright, glittering things and never check morale.",
    noMorale=True)
add("Dzór", "1128 (4)",
    "Huge, shambling, hairy forest giants 10-12 ft tall, with a horny beak and three round eyes with nictitating lids.",
    "Generally neutral; they ignore parties unless attacked. Keen night sight and poor day sight: +2 to hit at night, -2 by day. They fight with clubs and maces (they dislike edged weapons) and add +2 damage per hit. They check morale normally. Semi-intelligent but cannot speak or be trained.",
    dmgBonus=2)
add("Feshénga", "1128 (5)",
    "A smooth-skinned, oily-looking serpent that runs on sixty tiny legs. Its serpent head carries three rows of needle-like teeth.",
    "It attacks anything it sees and never checks morale. 25% of bites are venomous: save against poison, and if the bite is venomous the victim dies unless Heal Serious Wounds or an Eye of healing is used within 5 turns.",
    noMorale=True)
add("Hyahyú'u", "1128 (6)",
    "Six-limbed pack animals covered in ragged black fur, with three eyes beneath a crest of sticky, spiny growths on top of a long, lozenge-shaped skull. Named for their eerie \"hyaa-hyuu\" cry.",
    "They fight humans only when they outnumber the party by 6 or more; otherwise they flee. They always run from a party that includes a Páchi Léi.")
add("Kurukú", "1128 (7)",
    "Little six-legged creatures with a pair of small hands just below a blunt, ape-like snout.",
    "They never attack and always flee if approached, but 50% try to snatch a bright object from a random nearby traveller (60% success), running off giggling like a person. 20% they drop it while fleeing; otherwise it is gone unless the Kurukú is cornered. Missiles need +1 to hit them.")
add("Mnór", "1128 (8)",
    "Hairy, twenty-legged insect creatures with huge faceted eyes.",
    "They usually try to flee (60%), but once fighting they fight to the death, swinging heavy clubs. A blow of more than 4 points has a 20% chance to shatter an eye, and the Mnór then turns and flees. They gather glittering objects in their lairs. The full entry gives 4-12 appearing; the summary table gives 1-12.",
    noMorale=True)
add("Rényu", "1128 (9)",
    "Man-like humanoids with long pointed snouts, sharp upturned ears, and blackish or brownish fur.",
    "Found mostly in forests and mountains. They speak simply and use ordinary weapons but no spells or devices. Subdued at 1 or 0 hit points, one can be trained in 3 months by an animal trainer to serve and fight loyally. They see in the dark and notice secret doors and traps on 1-4 on 1d6. Each may carry 1-6 Káitars.")
add("Sérudla", "1128 (10)",
    "Huge creatures like armoured dragons covered in shimmering scales, with six limbs plus a pair of small arms just below a long neck and massive, bony head. Ordinary ones are about 15 ft long, large ones 25 ft and very large ones about 35 ft.",
    "Semi-intelligent; they fight with ordinary weapons and may also spit acid in the same round (3 times a day, 40% each round), reaching 120 ft and hitting everything in a 10-ft area. Save against poison: success takes 1d6; failure takes 1d12 six-sided dice. Not always hostile: roll reactions.",
    sizes=(["ordinary", "large", "very large"], [33, 33, 34], ["5", "8", "12"]))
add("Tsi'íl", "1128 (11)",
    "Huge, gentle plant-eaters with a horny carapace, a spiked crest, and rows of jagged spikes along the back. The tail ends in a spiked, mace-like ball.",
    "Passive; it lumbers away unless attacked, then fights with its tail at +2 damage. It is hunted for a gland that repels the Haqél, Tletlákha and some other sea creatures (80%, lasting 3 turns), sold for 200-4,000 Káitars.",
    dmgBonus=2)
add("Zrné", "1128 (12)",
    "Muddy-grey six-legged beasts about eight feet long, with a monstrous head full of rows of needle-pointed barbed teeth and a tough hide.",
    "Ordinary missiles cannot pierce its hide. Its back legs let it leap high over obstacles onto prey. The barbed teeth break off in the wound and take a combat round to remove; if they cannot all be removed (60% chance), the victim must save against poison or die within two combat rounds. It never checks morale.",
    noMorale=True)

# ---------------- Water creatures (Sec. 1129)
add("Akhó", "1129 (1)",
    "A monstrous, sinewy, cucumber-shaped body with one glaring red eye on top, twenty steel-hard tentacles, and below them a huge maw lined with leafy membranes that dissolve prey with acid.",
    "It lives at the bottom of the sea or large waters and attacks ships: 60% it attacks the hull (the referee decides how much damage the hull can take), 40% it snatches defenders off the deck. 15% it has swallowed a glittering object (treasure type C).",
    sizes=(["small", "medium", "extra-large"], [50, 30, 20], ["6", "10", "16"]))
add("Chashkéri", "1129 (2)",
    "Looks, at first glance, like a lovely dark-haired maiden.",
    "A master of hypnosis: it can hold 1-12 persons each round, each saving only on 61-100 on d100 at any level (Ahoggyá, Shén and Tinalíya are hardly affected). It drags a hypnotised victim under water to its lair; unless his comrades kill it at the start of the next round, he drowns within a round (20% the body floats up and can be revived). A rescued victim is dazed for two days. Easily slain, but it can escape by swimming to its lair.")
add("Ghár", "1129 (3)",
    "A heavily armoured river or shore beast 12-15 ft long with a turtle-like shell, three sets of powerful jaws hidden in cavities beneath it, and a spiked tail.",
    "It shoots out its jaws to 10 ft and can bite three times a round, and lashes attackers behind it with its tail. It always attacks and never checks morale. The inside of its shell is like mother-of-pearl and worth 80-1,600 Káitars.",
    noMorale=True, attacks=3)
add("Haqél", "1129 (4)",
    "A scaly creature lurking just below the surface of calm lakes and tidal pools, with a vast horn-rimmed mouth full of razor-sharp horn teeth and a mighty tail. Small ones are about 15 ft long, medium ones 25-30 ft, and real monsters 35-50 ft.",
    "It waits with mouth open for a swimmer or boat to pass over. A seized victim is dragged under unless he saves on 61-100 on d100 at any level. It bites, and 40% of rounds also strikes with its tail. Repelled by the gland of the Tsi'íl.",
    sizes=(["small", "medium", "huge"], [50, 40, 10], ["5", "10", "15"]))
add("Kruá", "1129 (5)",
    "A platter-shaped, shelled crustacean with six long spidery legs and two saw-toothed fighting arms ending in massive pincers. Sizes run 10 ft across, 15-20 ft, and 30-40 ft.",
    "Missiles, even magic arrows, bounce off its armour: it must be disabled by cutting off its legs and arms. Blood turns it away (60% it leaves after a sacrifice), and it scuttles back to the depths chittering. Each size moves at a different speed (9, 12, 18).",
    sizes=(["10 ft", "15-20 ft", "30-40 ft"], [60, 30, 10], ["3", "8", "16"]))
add("Mu'ágh", "1129 (6)",
    "An acid-secreting jelly from one to ten feet across that hides in dark, damp places.",
    "Its acid damage can never be healed: determine the body part struck at random; it is permanently useless. The acid cannot penetrate Chlén-hide but eats through steel, even enchanted, in one round, so the victim has one round to tear the piece off. Cloth and leather do not stop it. Fire and intense cold kill it. 10% it has swallowed a gem. The Eye of Regeneration can restore a part lost to its acid.",
    sizes=(["small", "medium", "very large"], [60, 30, 10], ["3", "6", "15"]))
add("Nenyélu", "1129 (7)",
    "Long, sinuous, black eel-like fish driven by many small sharp side fins, with a pair of small hands just behind the snake-like head.",
    "Two attacks a round: a jagged stone thrown or swung with its hands, and a poisonous bite (save against poison; even a successful save takes 1d6).",
    attacks=2)
add("Ngrútha", "1129 (8)",
    "Shelled, crab-like creatures with eight sucker-tipped legs, needle-tipped claws and a thin proboscis.",
    "It seizes a victim (60%) and drives its proboscis through any gap in his armour, sucking him dry in 3 combat rounds and leaving an empty husk; his comrades can only save him by killing it in time. It fights off others with its claws meanwhile. It surprises prey on 1-4 on 1d6 and is never surprised.")
add("Qáqtla", "1129 (9)",
    "A snake-like creature up to 10 ft long covered in strong scale armour, with a whip of poisoned tentacles.",
    "It lives in riverbanks and on the seashore, always attacks and never checks morale. Anyone struck must save against poison.",
    noMorale=True)
add("Sró", "1129 (10)",
    "Six-legged dragon-like mutants of an ancient reptile stock that walk, swim and fly, with a pair of small arms just beneath a long dragon head and a jagged-toothed beak. They range from 15-20 ft to 40-60 ft long.",
    "Each round, 75% it swings a huge broadsword in each hand, 25% it bites. Intelligent enough to gather treasure; 60% chance it can be talked out of attacking with a gift of jewellery.",
    sizes=(["15-20 ft", "25-35 ft", "40-60 ft"], [40, 40, 20], ["5", "9", "13"]), attacks=2)
add("Tletlákha", "1129 (11)",
    "Little more than a fanged mouth ringed by six eyes, with a stretchable stomach sac and a tiny tail. The ridge over its eyes bristles with barbed spines.",
    "It latches onto a random victim (60%); a comrade has 40% to pull it off, and removing the spines does 2d6. While attached it hits automatically every round; ordinary Chlén-hide or steel armour does not help, though enchanted armour gives 40% to avoid the fangs. Repelled by the gland of the Tsi'íl.")
add("Tsóggu", "1129 (12)",
    "Vaguely human, looking and smelling like a corpse several days in the water, with white, pupilless eyes.",
    "Its gaze paralyses 1-6 beings (save allowed) so it can feed on them; Heal Serious Wounds or an Eye of healing cures the victim. Because attackers must avoid its eyes, everyone needs +3 to hit it. A mirror does not turn its power back on itself.",
    acMagic=3)

# ---------------- Underworld (Sec. 1221)
add("Aqáa", "1221 (1)",
    "A huge, accordion-shaped worm 20-60 ft long covered in ragged brown bristles, with a mouth big enough to swallow a large man.",
    "It swallows victims, who have 30% each round for two rounds to cut their way out before being digested. Up to three comrades at its side each have 15% to cut him out, or they can kill it within the two rounds. Its tail also swings each round for 3d6. A digested victim can be revived but cannot fight for two weeks.",
    sizes=(["small", "medium", "large"], [20, 40, 40], ["6", "12", "18"]), attacks=2)
add("Biridlú", "1221 (2)",
    "A black, cape-like flying creature that clings to ceilings, with powerfully muscled folds.",
    "An ancient treasure guardian. It drops on the unwary and smothers its victim, gibbering and shrieking: 1d6 the first round, 2d6 the second, 3d6 the third. The victim has 40%, then 30%, then 15% to cut free; comrades free him only by killing it. Only steel cuts it, not Chlén-hide. It fights madly until dead and must be burned or it regenerates in 3 rounds.",
    noMorale=True)
add("Dlaqó", "1221 (4)",
    "Great armoured carrion beetles with an iridescent green carapace, six legs and powerful scissor-like mandibles.",
    "They attack only if they surprise a party or the party is small (1-12); otherwise they scuttle away. In a room with a recently slain being, roll 1d6: on 1-2 Dlaqó are there feeding.",
    sizes=(["small", "medium", "large"], [20, 40, 40], ["3", "6", "9"]))
add("Hli'ír", "1221 (5)",
    "A mad creature so hideous that merely looking at it can drive a person insane.",
    "If it surprises the party, each of the nearest 12 has 70% to see it and must roll 15+ on d20 or go mad; without surprise, each has 60% to see it and needs 12+. A maddened character attacks his party 80% of the time. 30% it rushes past without stopping. Only steel or better harms it; a mace blow of more than 6 points stuns it for a round (80%).")
add("Hrá", "1221 (6)",
    "Great grey undead monsters, creations of the ancient Priests of Ksárul.",
    "They fight as men do with swords and lances, drain victims of blood and fluids to a shrivelled husk, and cannot bear light. Reduced to 0 hit points they rise again in two turns and pursue (90%) unless touched with the Amulet of the Good God. A Priest of Ksárul has 15% to control one on the first round, unless it surprised the party.")
add("Hurú'u", "1221 (7)",
    "Spectral undead that wander the Underworld howling.",
    "They can be heard, and sense a party, at 200 ft. Their howling deafens everyone within 10 ft. Chlén-hide weapons do -1 damage to them. Protection from Evil/Good or fire drives them off (40% each round). A being slain by a Hurú'u loses one experience level.")
add("Kúrgha", "1221 (9)",
    "Scuttling, six-limbed, furry carrion eaters up to four feet long and three feet tall, with sharp horny beaks and three eyes.",
    "They attack only when they outnumber a party. In a room with dead bodies, roll 1d6: on 1-2 Kúrgha are there eating. Their stench gives them away at 50 ft, even through doors.")
add("Marashyálu", "1221 (10)",
    "A supernatural treasure guardian of the ancients that wears illusions, appearing as a weeping child, a woman or a wounded friend begging for help. Its true body has a long proboscis.",
    "Each round it can captivate the nearest 1-6 beings (save against hypnosis); a captive can be made to fight his own party. If it carries a victim off, it sucks out his soft organs with its proboscis. Protection from Evil/Good drives it off.")
add("Mrúr", "1221 (11)",
    "The reanimated corpses of ancient warriors who died in the catacombs, raised by the Priests of Sárku or Ksárul.",
    "They always attack and never check morale. A slain Mrúr regenerates within two turns unless burned.",
    noMorale=True)
add("Ngáyu", "1221 (13)",
    "Flattish crustaceans with powerful claws and six legs.",
    "50% of rounds it squirts a liquid up to 20 ft instead of clawing. The liquid destroys metal, magical or not, but not Chlén-hide. On a hit, roll 1d6 for the share of the victim's metal items destroyed (1 = 1/6, 2 = 1/3, 3 = 1/2, and so on), choosing items at random. The Amulet of Invincible Steel protects against it.")
add("Ngóro", "1221 (14)",
    "A huge creature about 30 ft long lying flat on a chamber floor, looking like rough Underworld paving that feels slightly springy underfoot. Millions of tiny cilia beneath it hold miniature weapons, including Eyes.",
    "Intelligent. Each round, 50% it uses its weapons and 50% it closes its folds on a party, crushing up to 20 at once for 2d6 a round; a character needs 14+ on d20 to jump clear, and trapped victims are freed only by killing it. Subdued at exactly 1 or 0 hit points, it offers one of its magical weapons for its life.")
add("Nshé", "1221 (15)",
    "A creature of ancient sorcery made entirely of thick, watery liquid. It flows under doors and through cracks and can rise up in a rough human, serpent or other shape.",
    "In a shape (50%), it can be destroyed for a time by weapons as usual. As a liquid it flows around a victim's feet (save 13+ on d20 to leap clear), crushing for 2 hit dice a round and drawing him in; held more than a round, both legs are crushed and need an Eye of Regeneration. In liquid form it can only be driven off: fire 10% a round, Calm 30%, the Amulet Against the Iniquitous Nshé automatically.")
add("Qól", "1221 (16)",
    "Mutants bred from human stock by the Priests of Ksárul: roughly human but with a slender reptilian neck and a flat, diamond-shaped serpent head.",
    "They see well in darkness and fear light. They fight with poisoned weapons, arrows included, and bite in the same round; both call for saves against poison. They attack only if they outnumber the party by 5-6; otherwise they try to flee. Each carries at most 2 Káitars.",
    attacks=2)
add("Qumqúm", "1221 (17)",
    "A spectral creature invisible to humans (though not to Pé Chói) that roars terribly as it moves. It wields a heavy poleaxe forged long ago by the Brethren of the Scarlet Nail, a sect of the priesthood of Sárku.",
    "Its roar can be heard 500 ft away. Because it is invisible, everyone but a Pé Chói needs +3 to hit it. Fire repels it (40%). The Abominable Eye of Detestation drives it off and the Incomparable Eye of Command controls it, though it gets a saving throw against each.",
    acMagic=3)
add("Ru'ún", "1221 (18)",
    "A man-like bronze demon automaton about seven feet tall, its body covered in a fine net of hair-thin wires.",
    "Set by the ancients to guard dimensional nexus points and treasures. Highly intelligent, but it will not talk with men. Three attacks a round: an electric shock from its wires (automatic 2d6), a +1 sword, and a device that throws steel bolts 30 ft. It sees invisible planes and hears what even Pé Chói cannot, so it is never surprised. It obeys only the Incomparable Eye of Command and the Amulet of Ruling the Ru'ún (it gets a save).",
    attacks=3, hitBonus=1)
add("Sagún", "1221 (19)",
    "A fungus killer-guardian made by the ancients: about eight feet tall, pallid and convoluted, leafy-looking, swaying on a mobile stalk, with woody claws.",
    "It strikes with its claws, and 60% of rounds it also releases spores; anyone who breathes them (60%) must save against poison, and needs Cure Disease or an Eye of Healing within two rounds or the spores sprout in the lungs and kill.")
add("Shédra", "1221 (20)",
    "Grey, shrivelled, flesh-eating undead, wasted almost beyond human form.",
    "They wander the Underworld hunting food and fight with steel swords. Anyone they kill becomes a Shédra unless Remove Curse is cast within two rounds; after that only a Wish or divine intervention can restore him.")
add("Thúnru'u", "1221 (22)",
    "An archaic, roughly man-like being, doughy and blubbery, with two saucer-shaped eyes, a greyish beak, and rolls of skin hanging about it like a robe.",
    "It prefers to kill Káyi, but attacks men to eat their eyes, which it relishes above all. It always attacks humans unless repelled by the smell of Tsúral buds (80%). Certain spells and Eyes can control it, and it sometimes serves a magician or an evil Priest or Warrior.")
add("Tsú'uru", "1221 (23)",
    "In truth a bundle of ropy, lumpy tentacles around a central brain ganglion, but it always wears an illusion until slain.",
    "A treasure guardian related to the Marashyálu. It reads the party's minds to choose the most convincing disguise (a Ru'ún, a friend) and may travel with them as a friendly character until it can strike. It fights with its own hit dice, not its disguise's. It is immune to all spells, and no ESP, clairvoyance or telepathy reveals it.")
add("Yéleth", "1221 (24)",
    "Androids made to look like beautiful maidens or handsome youths, with paper-white skin and hair like polished ebony.",
    "Each round it can hypnotise 1-6 beings (save against hypnosis). A victim can be ordered to fight his own party, or simply paralysed forever; only an Eye of Healing or Remove Curse ends the paralysis.")
