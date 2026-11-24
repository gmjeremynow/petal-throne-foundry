# Run from build_packs.py (exec) before the write step. Adds EPT Secs. 1500, 1600, 1700, 1800-1920 and 2200:
#   docs["magic-items"]     miscellaneous magical items and books (Items)
#   docs["treasure-tables"] the random tables (RollTables)
#   docs["macros"]          the treasure roller macro
# and writes module/treasure-data.mjs, the same tables for the treasure roller (module/treasure.mjs).
# Text is plain-words summaries; tables are transcribed from the page images of EPT (1975).

M = f"{EPT} Sec. 1500"
B = f"{EPT} Sec. 1700"

# ------------------------------------------------------------------ Sec. 1500: miscellaneous magical items
# (name, charged (d100 charges), rechargeable by the Thoroughly Useful Eye, how many exist, summary)
MISC = [
 ("The Alluring Maiden of Ngá", True, False, "two known",
  "An android assassin shaped like a beautiful girl (ebon hair, paper-white skin). Stalks and kills her owner's chosen victim with noose, dagger or poison, never giving up until the victim is dead; she may carry 1-3 Eyes (roll randomly). AC I, 6 hit dice. Mindless (cannot be detected by telepathy, cannot speak, cannot be given other tasks). Each mission uses 10 charges (round to the nearest 10). At the start of each mission the owner must roll 8+ on d20 or she attacks him instead."),
 ("The Boots of Changéla", False, False, "one pair",
  "Made by the wizard Changéla of Kettuláno: the wearer walks on water, carrying up to 250 pounds without sinking. No charges, no distance limit."),
 ("The Chariot of the Gods", True, True, "several rumoured; a 'stable' of five or more said to lie under Tsámra in Livyánu",
  "An ancient air car: carries 1-6 people and flies 30\" per turn. Sides and bottom stop all missiles smaller than a catapult stone; Eyes and spells may get through."),
 ("The Clockwork Automaton of Qiyór", False, False, "two known (ten were made)",
  "A fighting robot: AC I, 10 hit dice, two huge broadswords (two hit chances a round, +2 damage). Fights ten melee rounds, then needs one round to rewind."),
 ("The Crystal Claw of Kúrutesh", True, True, "one",
  "Communication with and control of animals (flyers and water beasts included; not intelligent or semi-intelligent beings, not the artificial creatures of the Underworld) within 12\" for three turns."),
 ("The Cup of Súbadim the Sorcerer", True, False, "one",
  "Pours a stream of any liquid the user wishes (water, oil, flammable chemicals, acid) to a range of 1\"; one melee round per charge."),
 ("The Emerald of Hagárr of Paránta", True, False, "one",
  "Power over water beings within 6\", one turn per charge."),
 ("The Glorious Cloak of Many Eyes", True, True, "said to be three",
  "The wearer projects his invisible self up to 30\" away to see and hear what happens there, without taking part."),
 ("The Gloves of Chirené", True, True, "one",
  "Belonged to the demon-warrior of N'lýss: +3 on all hit chances (Sec. 720) and all damage dice doubled."),
 ("The Hammer of Pendárte of Khéiris", False, False, "one, said to be hidden in Yán Kór",
  "Warhammer +2 on hit chances and +3 on damage; returns to the user's hand when thrown. No charges."),
 ("The Helmet of the Three-Pointed Star", True, False, "said to be ten",
  "Restores life to any being slain within the past 24 hours; the revived being may act at once and loses no Constitution (Sec. 413). NOT rechargeable."),
 ("The Jade Bowl of the God-King of Purdánim", True, False, "two, by legend",
  "Looking into it, the user swaps minds with another being of the same race within 12\" for 24 hours (the victim may save, using the Eyes column). If the user is slain in the other body, he is dead and the other keeps his body for good. NOT rechargeable."),
 ("The Ladder of Mríddu the Magician", False, False, "said to be three",
  "Folds to the size of a hand (six ounces) and unfolds into a ladder over 50 feet long holding six men; tiny claws at the top hold it fast until released. Reusable."),
 ("The Lightning Bringer", True, True, "at least fifteen (three in the Imperial arsenal at Avanthár)",
  "Self-propelled ancient artillery on wheels (moves 6\" per turn, no charge used). Range 24\": each charge smashes through a six-foot wall (2\" diameter area), or does 10d6 to a being."),
 ("The Little House of Tranquil Dwelling", False, False, "one, lost in an ancient Underworld",
  "A small mirror-like cube: pressing a stud draws one person inside, safe from all attack for as long as he stays, with breathable air and room for a lifetime's food; no contact with the outside. A stud inside lets him out. No charges."),
 ("The Magical Chest of the Topaz God", False, False, "five or six, by legend",
  "A small, plain bronze chest that holds any amount of treasure, weapons, etc. (not living beings), as long as one edge, corner or protuberance fits its 6-inch square mouth. No charges."),
 ("The Mallet of Inimitable Fealty", True, True, "about fifteen (one with the priests of Vimúhla, one with a senior Royalist noble)",
  "Engsvanyáli; touched to bare skin, it lays a Mind-Bar: loyalty, forgetting, a quest, etc. Affects all levels; save only on 17+ on d20. Each charge lasts one month of game time and cannot be ended early. Indicator in Engsvanyáli."),
 ("The Mighty Wall of Thúmis", True, True, "seven or eight",
  "Each charge raises a bronze wall 10 ft high, 30 ft wide and 6 ft thick (fits smaller spaces safely) for two full turns. No charge indicator."),
 ("The Music Box of Nekkutháne", True, True, "one recorded",
  "Its melody controls the Ngóro (Sec. 1221 (14)), one turn per charge."),
 ("The Silver Serpent of Nayári of the Silken Thighs", True, False, "one",
  "A six-inch silver serpent of the Bednálljan queen: sent to a place, it crawls 6\" per turn, bites whoever is there (-2 on saves vs. poison for all beings), returns and switches off. 75% chance the victim does not see it, whatever his level. If attacked: AC II, 2 hit dice, -2 to opponents' hit chances. Charge indicator behind the head."),
 ("The Skullcap of Girigámish", True, True, "one known; possibly several made for the priests of Ksárul",
  "A brass cap: immunity to telepaths reading one's thoughts and to ESP. Each charge lasts one day. Indicator in Ancient Salarvyáni."),
 ("The Speaker to Heaven", True, False, "one",
  "A small golden, ruby-set image of an ancient deity: +10% to the user's chance of Divine Intervention. Indicator in Llyáni. NOT rechargeable."),
 ("The Trumpet of Metállja", True, False, "one",
  "The horn of the Salarvyáni hero: summons any android or automaton within 6\" to obey the user for two turns. Needs Strength 96+ to blow (Sec. 411). Indicator in Ancient Salarvyáni. NOT rechargeable."),
 ("The Wondrous Enhancer of Jewels", True, True, "at least ten",
  "An automatic gem cutter and polisher: a gem put through it is worth ten times its assessed value. Indicator in Ancient Tsolyáni."),
]

# ------------------------------------------------------------------ Sec. 1700: books
# (name, English title, language, summary)
BOOKS = [
 ("Korúnkoi hiQiyór", "The Book of Qiyór", "modern Tsolyáni",
  "Magic Users only: a good Magic User gains one level; an evil one gains a level but takes 2d6. Fighters cannot read it; no use to Priests, though an evil Priest takes 2d6."),
 ("Korúnkoi hiSsánu hiMissúma", "The Book of the Dance of Death", "modern Tsolyáni",
  "Dedicated to Hrü'ü. An evil Magic User gains one level; a good one LOSES one. An evil Priest gains 1d6 hit points permanently; a good Priest loses 1d6 permanently. A fighting man takes 1d12 just opening it. Harmless to nonhumans."),
 ("Korúnkoi hiKhéshdu hiMrúrgayal", "The Book of Sending Forth the Hated Dead", "modern Tsolyáni",
  "Dedicated to Ksárul; for evil Priests of level V+: +1d6 damage on every successful hit (Eyes and spells included) for four turns, and control of any undead for five turns. Reusable once a week. Magic Users, good Priests and evil Priests below V take 2d6; fighters below level V die at a glance, higher fighters take 1d12."),
 ("Korúnkoi hiSsyúsayal", "The Book of Mighty Swords", "modern Tsolyáni",
  "Warriors only: a fighter of level III+ (nonhumans too) gains one level; the book then vanishes. No effect on Priests or Magic Users."),
 ("Timándálikh hitúplanMitlándálisayal", "The Great Understanding of the Beloved, Great, and Powerful Gods", "modern Tsolyáni",
  "Dedicated to Thúmis: a good Priest of level IV+ gains one level. An evil Priest of any level takes 2d6; others are unaffected."),
 ("Chégudálikh hiQón", "The Mighty Grace of Qón", "modern Tsolyáni",
  "Dedicated to Qón: a Priest of Qón gains TWO levels; any other good Priest or good Magic User gains one. Evil Priests and Magic Users are slain; fighting men are unaffected."),
 ("Chánisayal hiHayá", "Powerful Maps of Glory", "modern Tsolyáni",
  "1d6 treasure maps, usable by anyone of level III+. The referee places the treasures (e.g. among the ancient cities of Sec. 1200), above or below ground."),
 ("Korúnkoi hiKérdusayal", "The Book of Powerful Generals", "modern Tsolyáni",
  "Fighters of level III+ only (nonhumans too): one level, plus any two Warrior skills from Sec. 430. No effect on Priests or Magic Users."),
 ("Dímlalikh tlaSsúgayal", "The Striking of the Hated Ssú", "modern Tsolyáni",
  "Dedicated to Karakán; for Warriors and Priests: +5 damage permanently on every successful blow against a Ssú (no effect against others)."),
 ("Hénganikh hiZhálmigan", "The Splendour of Decay", "modern Tsolyáni",
  "Dedicated to Sárku: evil Priests or Magic Users of level V+ gain +1 to hit and +2 on damage permanently. Good Priests and Magic Users must roll 12+ on d20 or die (no effect if they save); any Warrior who glances inside dies. Nonhumans cannot read it and are unaffected."),
 ("Li'ób Miffánsa Missrábchi'i MikKsárulkchi", "The Book of Sending Forth the Servant of Great Ksárul", "modern Livyáni",
  "Calls the demon Origób for two turns (20 melee rounds): serpentine, six sucker-tipped mouths, 15 hit dice, AC I, six hit chances a round, moves 15\"; its bites are poisonous (Neutralise Poison or an Eye of Healing within one turn). A Priest or Magic User must master it: 17+ on d20 at levels I-III, 14+ at IV-VII, 12+ at VIII+, or it turns on him. Fighters and nonhumans cannot use it and are unaffected."),
 ("Chnéshaq KhyChnéshayalu", "The Mystery of Mysteries", "Classical Tsolyáni",
  "+5% to the chance of Divine Intervention. Usable by anyone of any profession, level, race or alignment. Disappears once read."),
 ("Kízhaga Dlittlúmri", "The Book of Five Fingers", "Pecháni",
  "Any Priest or Magic User (no effect on Warriors). Five powers: (a) fly 30\" per turn for two turns; (b) paralyse 1-6 hostile beings (they may save); (c) regenerate one limb or organ destroyed by Mu'ágh acid; (d) three fireballs (range 24\", 1\" diameter, 4d6 each); (e) one extra Bonus Spell from Group II or III, permanently. All but (e) work once; then the pages go blank."),
 ("Jnéshtlaq Kéq Yóssu", "The Tome of Black Mold", "ancient N'lýssa",
  "A Priest or Magic User of level V+ is taken to the Tomb of the Lord of Black Mold in the Secret City of Schyák in N'lýss for one turn and may carry off what he can (the referee rolls two Type I treasures to choose from; the Eye of Retaining All Things and the Magical Chest of the Topaz God do not work there; mind the load limits of Sec. 920), then returns. Lesser characters and all Warriors take 2d6 and the book crumbles. Usable once."),
 ("Guppíshsha Hrákkuq Mazhzhátl", "The Book of the Fragrant Garden", "modern Salarvyáni",
  "Magic Users or Priests of level II+ roll d12: 1-3 slain by a hideous fungus (no save; may be revived); 4-6 gain one level; 7-9 permanent ESP, detection of secret doors and traps, and one use of growing or shrinking to any size for a turn; 10-11 permanent detect good/evil and detection of shifting walls and passages, and one use of transporting himself and 1-6 beings 30\"; 12 the power to revive good beings or (50/50) evil ones, never both, three times. Warriors take 1d6 and the book disappears."),
 ("Zrú Hsún Tí Ch'à", "The Excellent Travelling Volume", "Tsáqw",
  "Anyone who can read it may, once, carry himself and 1-10 companions (or the equivalent weight) to any place on Tékumel he has been before. It can be kept until needed; it does not bring them back."),
 ("Jurrúmra Miye'éklun Tlakotáni", "The Scroll of the Scarlet Brotherhood", "Engsvanyáli",
  "Secretly reverses the reader's alignment (any profession or level). Level VI+ may save on 16+ on d20: then no change, and the reader can enchant weapons up to +3 and armour up to +2, once a week, a full day's ritual each. A nonhuman reader gains nothing, does not change, and takes 2d6."),
 ("Duré'ep Tkásh Sneqsíva", "The Pessimistic Treatise of Total Inaction", "Milumanayáni",
  "Dedicated to Drá the Uncaring; blank but for the title. A reader of level I-VI falls into total, permanent indifference (not eating, drinking or caring whether he lives) unless the Amulet of the Good God is applied within ten turns. Level VII+ saves on 12+ on d20 (no effect if saved). Works once, then disappears."),
 ("Hlórush Zhdanáwi Migún", "The Book of Eyes", "Mihálli",
  "For Priests or Magic Users of level VI+: how to build 1d6 Eyes (chosen at random from Sec. 1310), four months each; materials may be costly or scarce. Each Eye's instructions fade once it is built, and there is a 20% chance per week the book fades if work has not begun. Fighters cannot use it."),
 ("Mó'om Té'ep Srásy", "The Exquisite Codicil of Srá", "ancient Llyáni",
  "For Priests or Magic Users of level VI+: instructions to build one Ru'ún and up to six Qól (Sec. 1221 nos. (18) and (16)), who serve their maker loyally and for good. The writing disappears once used. Warriors cannot use it."),
 ("Barukán Lli Fèshdrubál-Chrén", "The Labyrinth of Mutable Destiny", "modern Yán Koryáni",
  "Dedicated to Fnér-Khmíshu (a Yán Koryáni form of Belkhánu). For good Priests or Magic Users of level IV+: 2d6 minor wishes, each with a 30% chance of the OPPOSITE result. Evil Priests or Magic Users take 2d6; Warriors cannot identify or use it."),
 ("Du'on Duqala Toruuna", "The Scroll of Bringing Forth the Unnamed", "the tongue of the Priests of Ksárul (blue flame on brass pages)",
  "Slays good Priests or Magic Users (no save; revival possible); Warriors cannot open it. Priests of Ksárul gain two levels; Priests of other evil gods or cohorts gain one, and evil Priests may create 1-6 Mrúr. Evil Magic Users gain no level but may create 1-6 Yéleth. Each creation needs the sacrifice of a human to Ksárul; the creatures serve loyally and for good. Usable once; then Ksárul's Black Angel takes it back."),
 ("Mi'ithurish Hrshenga Mmeghusane", "The Treatise of Hrsh, the Highest Lord", "modern Mu'ugalavyáni",
  "Anyone can read it; only Priests and Magic Users of level V+ can use it. Roll d12: 1-2 slain (no save); 3-4 sent on a quest for the lost idol of Hrsh in the jungles southwest of Mu'ugalavyá; 5-6 receives the Glorious Cloak of Many Eyes; 7-8 permanent +1 on saves vs. spells; 9-12 permanent +2 on damage dice against animals and nonhumans (not humans or Underworld creatures); 11 transported to the lowest level of an Underworld of the referee's choice; 12 six extra hit points permanently (Sec. 710). The book prints 9-12, 11 and 12 as shown; the overlap is in the original. Usable once."),
 ("Púrohlan Znamríshsha Kagékte", "The Book of the Unnamed God", "ancient Salarvyáni of the Bednállja Dynasty",
  "Anyone of level V+ who can read it calls a god or cohort to aid him for two turns (d20: 1 Hnálla, 2 Karakán, 3 Thúmis, 4 Avánthe, 5 Belkhánu, 6 Drá, 7 Chegárra, 8 Keténgku, 9 Dilinála, 10 Qón, 11 Hrü'ü, 12 Vimúhla, 13 Ksárul, 14 Sárku, 15 Dlamélish, 16 Wurú, 17 Chiténg, 18 Grugánu, 19 Durritlámish, 20 Hriháyal); an evil deity may thus serve a good character or the reverse. The referee decides the service. Vanishes once used."),
]

def magic(pack, name, cat, desc, src, uses, sort, folder, img):
    it = item(pack, name, "magicItem", img, {"description": desc, "source": src, "cost": 0, "weight": 0, "quantity": 1, "category": cat,
             "uses": {"value": 0, "max": uses}, "range": "", "duration": "", "save": "", "alignmentRestriction": "", "equipped": False}, sort)
    it["folder"] = folder
    return it

F_MISC = did("magic-items", "folder", "misc"); F_BOOK = did("magic-items", "folder", "books")
folders["magic-items"] = [
    {"_id": F_MISC, "name": "Miscellaneous Magical Items (Sec. 1500)", "type": "Item", "folder": None, "sorting": "m", "sort": 100000, "color": None, "description": "", "flags": {}, "_key": f"!folders!{F_MISC}"},
    {"_id": F_BOOK, "name": "Books (Sec. 1700)", "type": "Item", "folder": None, "sorting": "m", "sort": 200000, "color": None, "description": "", "flags": {}, "_key": f"!folders!{F_BOOK}"}]
mi = []
for i, (n, charged, rech, count, d) in enumerate(MISC, 1):
    extra = []
    if charged: extra.append("Charges: roll d100 when found." + (" Rechargeable with the Thoroughly Useful Eye." if rech else ""))
    extra.append(f"How many exist: {count}. Never for sale, though one may sometimes be borrowed from a temple or the Imperium for a mission.")
    mi.append(magic("magic-items", n, "misc", p(d, *extra), f"{M} no. {i}", 100 if charged else 0, i * 1000, F_MISC, "icons/svg/chest.svg"))
for i, (n, t, lang, d) in enumerate(BOOKS, 1):
    mi.append(magic("magic-items", n, "book", p(f"<i>'{t}'</i>. Written in {lang}.", d,
              "A reader who does not know the language usually escapes its effects and cannot even identify it. Never for sale or loan."),
              f"{B} no. {i}", 0, i * 1000, F_BOOK, "icons/svg/book.svg"))
docs["magic-items"] = mi

# ------------------------------------------------------------------ tables (shared by the RollTables and the roller)
# Each table: rows of (low, high, text). Transcribed from EPT 1975.
T = {}
T["gemBase"] = ("Gem base value (Sec. 2210)", "1d100", [(1, 10, "20"), (11, 25, "50"), (26, 65, "100"), (66, 80, "500"), (81, 85, "1,000"), (86, 90, "2,000"), (91, 95, "5,000"), (96, 99, "10,000"), (100, 100, "50,000")])
T["jewelryBase"] = ("Jewelry base value (Sec. 2210)", "1d100", [(1, 20, "3d6 × 100"), (21, 50, "1d6 × 1,000"), (51, 70, "1d8 × 1,000"), (71, 80, "1d12 × 1,000"), (81, 90, "2d6 × 2,000"), (91, 99, "1d8 × 5,000"), (100, 100, "1d6 × 10,000")])
T["armsType"] = ("Arms or armour: which item (Sec. 2230)", "1d20", [(1, 5, "Shield"), (6, 8, "Helmet"), (9, 12, "Armour"), (13, 17, "Sword"), (18, 20, "Miscellaneous weapon")])
T["miscType"] = ("Miscellaneous treasure: which kind (Sec. 2230)", "1d20", [(1, 7, "Amulet (Sec. 1400)"), (8, 16, "Scroll (Sec. 1600)"), (17, 18, "Miscellaneous magical item (Sec. 1500)"), (19, 20, "Book (Sec. 1700)")])
T["armourPlus"] = ("Magic shield, helmet or armour (Sec. 1820)", "1d100", [(1, 50, "+1"), (51, 85, "+2"), (86, 100, "+3")])
T["swordPlus"] = ("Magic sword (Sec. 1820)", "1d100", [(1, 50, "+1 on hitting chances"), (51, 80, "+2 on hitting chances"), (81, 90, "+3 on hitting chances"),
    (91, 92, "+1 on hitting chances; +1 on damage"), (93, 94, "+2 on hitting chances; +1 on damage"), (95, 96, "+2 on hitting chances; +2 on damage"),
    (97, 98, "+3 on hitting chances; +2 on damage"), (99, 99, "+3 on hitting chances; +3 on damage"), (100, 100, "+4 on hitting chances; +3 on damage")])
T["miscWeapon"] = ("Miscellaneous magic weapon (Sec. 1820)", "1d100", [
    (1, 5, "Warhammer, +1 on hitting chances"), (6, 10, "Warhammer, +2 on hitting chances"), (11, 15, "Warhammer, +2 on hitting chances and +1 on damage"),
    (16, 20, "Bow, +1 on hitting chances"), (21, 25, "10 arrows, +1 on damage"), (26, 30, "10 arrows, +2 on damage"),
    (31, 35, "Sling, +1 on hitting chances"), (36, 40, "Sling, +2 on hitting chances"), (41, 45, "Bola, +1 on hitting chances"), (46, 50, "Bola, +2 on hitting chances, +1 on damage"),
    (51, 55, "Spear, +1 on hitting chances"), (56, 60, "Spear, +2 on hitting chances"), (61, 65, "Spear, +2 on hitting chances, +1 on damage"),
    (66, 70, "Dagger, +1 on hitting chances"), (71, 75, "Dagger, +2 on hitting chances"), (76, 80, "Dagger, +3 on hitting chances, +1 on damage"),
    (81, 81, "Scimitar, +1 on hitting chances"), (82, 82, "Scimitar, +2 on hitting chances"), (83, 83, "Scimitar, +3 on hitting chances"),
    (84, 84, "Scimitar, +1 on hitting chances, +1 on damage"), (85, 85, "Scimitar, +2 on hitting chances, +1 on damage"), (86, 86, "Scimitar, +3 on hitting chances, +2 on damage"),
    (87, 87, "Scimitar, +3 on hitting chances, +3 on damage"), (88, 88, "Scimitar, +4 on hitting chances, +3 on damage"),
    (89, 89, "Scimitar, +3 on hitting chances, each hit drains one experience level from the victim"), (90, 90, "Scimitar, +4 on hitting chances, each hit drains one experience level from the victim"),
    (91, 91, "Battle-axe, +1 on hitting chances"), (92, 92, "Battle-axe, +2 on hitting chances"), (93, 93, "Battle-axe, +3 on hitting chances"),
    (94, 94, "Battle-axe, +1 on hitting chances, +1 on damage"), (95, 95, "Battle-axe, +2 on hitting chances, +1 on damage"), (96, 96, "Battle-axe, +3 on hitting chances, +2 on damage"),
    (97, 97, "Battle-axe, +3 on hitting chances, +3 on damage"), (98, 98, "Battle-axe, +4 on hitting chances, +3 on damage"),
    (99, 99, "Battle-axe, +3 on hitting chances, each hit drains one experience level from the victim"), (100, 100, "Battle-axe, +4 on hitting chances, each hit drains one experience level from the victim")])
T["weaponAlign"] = ("Magic edged weapon: alignment (Sec. 1810)", "1d100", [(1, 40, "Good"), (41, 90, "Evil"), (91, 100, "No alignment (serves either side)")])
T["weaponInt"] = ("Magic edged weapon: intelligence (Sec. 1810)", "1d100", [(1, 50, "No intelligence"), (51, 60, "Low: the owner senses only simple emotions (empathy)"),
    (61, 70, "Communicates telepathically with its owner only"), (71, 80, "Speaks aloud"), (81, 90, "Very intelligent: speaks one other modern language besides Tsolyáni (or the local tongue)"),
    (91, 100, "Extremely intelligent: speaks two extra modern languages")])
T["weaponEgo"] = ("Magic edged weapon: ego (Sec. 1810)", "1d100", [(1, 50, "No perceptible ego"), (51, 60, "Weak: can control a level I owner"), (61, 70, "Average: can control an owner up to level III"),
    (71, 80, "Strong: can control an owner up to level V"), (81, 90, "Very strong: can control an owner up to level VII"),
    (91, 100, "Extreme: can control an owner up to level VIII, and force 1-3 persons of levels I-IV within 2\" to obey it for two turns")])
T["weaponEnemy"] = ("Magic edged weapon: specific enemies, intelligence 81+ only (Sec. 1810)", "1d100", [(1, 60, "No specific enemies"),
    (61, 64, "Hates undead: +1 damage against them"), (65, 68, "Hates Priests of the opposite alignment: +1 damage against them"),
    (69, 72, "Hates nonhumans of the opposite alignment (not the neutral races): +1 on hitting, +2 on damage against them"),
    (73, 76, "Hates Magic Users of the opposite alignment: +1 on hitting, +2 on damage against them"), (77, 80, "Hates flying creatures: +2 damage against them"),
    (81, 84, "Hates all Underworld creatures: +1 against them"), (85, 88, "Hates all Warriors: +1 on hitting, +2 on damage against them"),
    (89, 92, "Hates all forest animals: +1 damage against them"), (93, 96, "Hates all water animals: +1 damage against them"),
    (97, 100, "Hates Sérudla: +1 on hitting, +3 on damage against them")])
T["scrollModern"] = ("Scroll language: modern (Sec. 1610)", "1d20", [(1, 4, "Tsolyáni"), (5, 7, "Salarvyáni"), (8, 10, "Mu'ugalavyáni"), (11, 13, "Livyáni"),
    (14, 15, "Yán Koryáni"), (16, 17, "Saá Allaqiyáni"), (18, 18, "Milumanayáni"), (19, 19, "Pecháni"), (20, 20, "Ghatóni")])
T["scrollAncient"] = ("Scroll language: ancient (Sec. 1610)", "1d20", [(1, 4, "Ancient Tsolyáni"), (5, 7, "Engsvanyáli"), (8, 10, "Ancient Salarvyáni"),
    (11, 13, "The Tongue of the Priests of Ksárul"), (14, 15, "Llyáni"), (16, 17, "Mihálli"), (18, 19, "N'lýssa, the Tongue of the Dragon Lords"), (20, 20, "Tsáqw, Ancient Yán Koryáni")])
T["scrollType"] = ("Scroll type (Sec. 1610)", "1d12", [(1, 1, "Type I: one spell of Group I"), (2, 2, "Type II: two spells of Group I"), (3, 3, "Type III: one spell of Group I and one of Group II"),
    (4, 4, "Type IV: two spells of Group I and one of Group II"), (5, 5, "Type V: two spells of Group II"), (6, 6, "Type VI: one spell of Group III"),
    (7, 7, "Type VII: two spells of Group III"), (8, 8, "Type VIII: one spell of Group II and two of Group III"), (9, 9, "Type IX: ESP and Revivify"),
    (10, 10, "Type X: Necromancy and the Grey Hand"), (11, 11, "Type XI: Remove Curse, Monster Control and Cure Serious Wounds"), (12, 12, "Type XII: Cursed Scroll")])
T["scrollCurse"] = ("Cursed scroll (Sec. 1610)", "1d20", [(1, 6, "All within 10 ft take 2d6 damage"), (7, 10, "An Underworld being of the referee's choice appears"),
    (11, 13, "All within 10 ft are struck with a rotting plague, fatal within two turns unless Cure Serious Wounds or the Eye of Healing is applied"),
    (14, 16, "All within 10 ft are turned into creatures of the referee's choice"), (17, 17, "All within 10 ft are transported to a random hex of the large terrain map"),
    (18, 18, "All within 10 ft are paralysed (save vs. paralysis)"), (19, 19, "All within 10 ft are slain (no save; revival possible)"),
    (20, 20, "Kukligásh the Eater appears: 14 ft, like a ragged tent, four tentacles (four hit chances a round), 12 hit dice, AC II; attacks at once; cannot be subdued, driven off by spells or slain: at 0 hit points he vanishes, leaving an emerald worth d100 × 100 Káitars; matches a party's Haste")])
T["scrollLang"] = ("Scroll language: modern or ancient (Sec. 1610)", "1d100", [(1, 60, "Modern language"), (61, 100, "Ancient language")])
T["eye"] = ("Eye (Sec. 2230: d6 and d12)", "1d36", [(i, i, f"Sec. 1310 no. {i}") for i in range(1, 37)])
T["amulet"] = ("Amulet (Sec. 1400)", "1d12", [(i, i, f"Sec. 1400 no. {i}") for i in range(1, 13)])
T["miscItem"] = ("Miscellaneous magical item (Sec. 1500)", "1d24", [(i, i, MISC[i - 1][0]) for i in range(1, 25)])
T["book"] = ("Book (Sec. 1700: d6 and d12)", "1d24", [(i, i, BOOKS[i - 1][0]) for i in range(1, 25)])

# Treasure types (Sec. 2220): column -> (number range, % chance). Coins are in thousands.
COLS = ["copper", "silver", "gold", "gems", "jewelry", "eyes", "arms", "misc"]
HOARD = {
 "A": [("1-6", 40), ("1-6", 30), ("1-6", 20), ("1-6", 20), None, ("1-3", 10), None, None],
 "B": [("1-6", 50), ("1-6", 40), ("1-6", 30), ("1-6", 30), ("1-6", 30), ("1-3", 20), ("1-3", 10), ("1", 10)],
 "C": [("2-12", 20), ("1-6", 50), ("1-6", 40), ("2-12", 20), ("2-12", 20), ("1-3", 30), ("1-3", 20), ("1-3", 10)],
 "D": [("2-12", 30), ("2-12", 40), ("2-12", 30), ("2-12", 40), ("2-12", 30), ("1-3", 40), ("1-3", 30), ("1-3", 20)],
 "E": [("2-12", 40), ("2-12", 50), ("2-12", 40), ("2-12", 50), ("2-12", 40), ("1-6", 20), ("1-3", 40), ("1-3", 30)],
 "F": [None, ("4-24", 20), ("2-12", 50), ("4-24", 20), ("2-12", 50), ("1-6", 30), ("1-3", 50), ("1-3", 40)],
 "G": [None, ("1-100", 30), ("10-40", 75), ("4-24", 40), ("4-24", 30), ("1-6", 40), ("1-6", 30), ("1-3", 50)],
 "H": [None, None, ("10-60", 80), ("1-100", 40), ("4-24", 40), ("2-12", 30), ("1-6", 40), ("1-6", 20)],
 "I": [None, None, ("1-100", 50), ("1-100", 50), ("6-36", 40), ("2-12", 40), ("2-12", 40), ("1-6", 30)],
}
# Sec. 1910: NPC magic arms and armour by level band. Rows: (what, [range per band 2-3, 4-5, 6-7, 8-9, 10+])
BANDS = ["2-3", "4-5", "6-7", "8-9", "10+"]
NPC_ARMS = [
 ("Shield", ["60-70", "50-55", "40-45", "30-35", "20-25"]), ("Armour", ["71-75", "56-60", "46-50", "36-40", "26-30"]),
 ("Helmet", ["76-80", "61-65", "51-55", "41-45", "31-35"]), ("Armour and Shield", ["81-85", "66-70", "56-60", "46-50", "36-40"]),
 ("Armour and Helmet", ["86-88", "71-75", "61-65", "51-55", "41-45"]), ("Helmet and Shield", ["89-91", "76-80", "66-70", "56-60", "46-50"]),
 ("Sword", ["92", "81-85", "71-75", "61-65", "51-55"]), ("Sword and Dagger", ["93", "86-90", "76-80", "66-70", "56-60"]),
 ("Sword and Armour", ["94", "91-92", "81-85", "71-75", "61-65"]), ("Sword and Shield", ["95", "93-94", "86-90", "76-80", "66-70"]),
 ("Sword and Helmet", ["96", "95-96", "91-93", "81-85", "71-75"]), ("Miscellaneous Weapon", ["97", "97", "94-95", "86-90", "76-80"]),
 ("Miscellaneous Weapon and Armour", ["98", "98", "96-97", "91-95", "81-85"]), ("Miscellaneous Weapon, Armour, and Shield", ["99", "99", "98", "96-97", "86-90"]),
 ("Miscellaneous Weapon, Armour, and Sword", ["100", "100", "99", "98-99", "91-95"]), ("One of each item (referee's option)", ["", "", "100", "100", "96-100"])]
NPC_DEVICES = [
 ("1 Amulet", ["75-80", "70-75", "65-70", "60-65", "55-60"]), ("1 Eye", ["81-85", "76-80", "71-75", "66-70", "61-65"]),
 ("1 Amulet and 1 Eye", ["86-90", "81-85", "76-80", "71-75", "66-70"]), ("1-3 Eyes", ["91-95", "86-90", "81-85", "76-80", "71-75"]),
 ("1-6 Eyes", ["96-97", "91-95", "86-90", "81-85", "76-80"]), ("1-3 Eyes and 1 Amulet", ["98-99", "96-97", "91-95", "86-90", "81-85"]),
 ("1-3 Eyes and 1 Scroll", ["100", "98-99", "96-97", "91-95", "86-90"]), ("1-3 Eyes, 1 Amulet, and 1 Scroll", ["", "100", "98-99", "96-97", "91-95"]),
 ("1-3 Eyes and 1 Miscellaneous Magical Item", ["", "", "100", "98-99", "96-97"]),
 ("1-6 Eyes, 1 Scroll, 1-3 Amulets, and 1 Miscellaneous Magical Item", ["", "", "", "100", "98-99"]),
 ("1-6 Eyes, 2 Scrolls, 1-3 Amulets, 1 Miscellaneous Magical Item, and one Book", ["", "", "", "", "100"])]
# Sec. 1820.4: weapon spells. Score at or above the number gives that many spells (reading of the table; see README).
WEAPON_SPELLS = {1: [60, 70, 80], 2: [50, 60, 70], 3: [40, 50, 60], 4: [30, 40, 50]}
# Sec. 1820.4: d6 for each spell's group, by the weapon's plus: list of (low, high, group)
WEAPON_SPELL_GROUP = {1: [(1, 3, 1), (4, 5, 2), (6, 6, 3)], 2: [(1, 2, 1), (3, 4, 2), (5, 6, 3)], 3: [(1, 1, 1), (2, 4, 2), (5, 6, 3)], 4: [(1, 3, 2), (4, 6, 3)]}

def rng(s):
    a, _, b = s.partition("-"); return [int(a), int(b or a)]

# RollTables
F_TT = {k: did("treasure-tables", "folder", k) for k in ("treasure", "arms", "scrolls", "items")}
folders["treasure-tables"] = [{"_id": v, "name": n, "type": "RollTable", "folder": None, "sorting": "m", "sort": s, "color": None, "description": "", "flags": {}, "_key": f"!folders!{v}"}
    for (k, v), (n, s) in zip(F_TT.items(), [("Treasure (Sec. 2200)", 100000), ("Magical arms and armour (Secs. 1800-1820)", 200000), ("Scrolls (Sec. 1600)", 300000), ("Magic items and books", 400000)])]
TFOLDER = {"gemBase": "treasure", "jewelryBase": "treasure", "armsType": "treasure", "miscType": "treasure", "armourPlus": "arms", "swordPlus": "arms", "miscWeapon": "arms",
           "weaponAlign": "arms", "weaponInt": "arms", "weaponEgo": "arms", "weaponEnemy": "arms", "scrollLang": "scrolls", "scrollModern": "scrolls", "scrollAncient": "scrolls",
           "scrollType": "scrolls", "scrollCurse": "scrolls", "eye": "items", "amulet": "items", "miscItem": "items", "book": "items"}
EYE_NAMES = [e["name"] for e in sorted(docs["eyes"], key=lambda e: int(e["system"]["source"].split("no. ")[1]))]
AMULET_NAMES = [a["name"] for a in docs["amulets"]]
def result_text(key, i, text):
    if key == "eye": return EYE_NAMES[i]
    if key == "amulet": return AMULET_NAMES[i]
    return text
tables = []
for n, (key, (title, formula, rows)) in enumerate(T.items()):
    tid = did("treasure-tables", key)
    res = []
    for i, (lo, hi, text) in enumerate(rows):
        rid = did("treasure-tables", key, str(i))
        txt = result_text(key, i, text)
        r = {"_id": rid, "type": "text", "name": txt, "text": txt, "description": txt, "img": "icons/svg/d20-black.svg", "weight": hi - lo + 1, "range": [lo, hi],
             "drawn": False, "flags": {}, "_key": f"!tables.results!{tid}.{rid}"}
        if key in ("eye", "amulet", "miscItem", "book"):
            pack = {"eye": "eyes", "amulet": "amulets"}.get(key, "magic-items")
            src = next(d for d in docs[pack] if d["name"] == txt)
            r.update({"type": "document", "documentUuid": f"Compendium.petal-throne.{pack}.Item.{src['_id']}"})
        res.append(r)
    tables.append({"_id": tid, "name": title, "img": "icons/svg/d20-grey.svg", "description": f"{EPT}.", "formula": formula, "replacement": True, "displayRoll": True,
                   "results": res, "folder": F_TT[TFOLDER[key]], "sort": n * 1000, "ownership": {"default": 0}, "flags": {}, "_key": f"!tables!{tid}"})
docs["treasure-tables"] = tables

MID = did("macros", "treasure")
docs["macros"] = [{"_id": MID, "name": "Roll Treasure", "type": "script", "img": "icons/svg/chest.svg", "scope": "global",
                   "command": "game.petalThrone.treasureDialog();", "folder": None, "sort": 0, "ownership": {"default": 0}, "flags": {}, "_key": f"!macros!{MID}"}]

# ------------------------------------------------------------------ module/treasure-data.mjs for the roller
def js(o): return json.dumps(o, ensure_ascii=False)
data = {
 "tables": {k: {"title": t, "formula": f, "rows": [[lo, hi, txt] for lo, hi, txt in rows]} for k, (t, f, rows) in T.items()},
 "hoard": {k: [None if c is None else [c[0], c[1]] for c in v] for k, v in HOARD.items()}, "hoardCols": COLS,
 "bands": BANDS, "npcArms": [[w, [rng(x) if x else None for x in r]] for w, r in NPC_ARMS], "npcDevices": [[w, [rng(x) if x else None for x in r]] for w, r in NPC_DEVICES],
 "weaponSpells": WEAPON_SPELLS, "weaponSpellGroup": WEAPON_SPELL_GROUP,
 "gemSteps": [20, 50, 100, 500, 1000, 2000, 5000, 10000, 50000, 75000, 100000],
 "jewelry": [[3, 6, 100], [1, 6, 1000], [1, 8, 1000], [1, 12, 1000], [2, 6, 2000], [1, 8, 5000], [1, 6, 10000]],
 "eyes": [[e["name"], e["_id"]] for e in sorted(docs["eyes"], key=lambda e: int(e["system"]["source"].split("no. ")[1]))],
 "amulets": [[a["name"], a["_id"]] for a in docs["amulets"]],
 "miscItems": [[d["name"], d["_id"], d["system"]["uses"]["max"] > 0] for d in mi if d["system"]["category"] == "misc"],
 "books": [[d["name"], d["_id"]] for d in mi if d["system"]["category"] == "book"],
}
open(os.path.join(ROOT, "module", "treasure-data.mjs"), "w", encoding="utf-8").write(
    "// Generated by tools/build_packs.py (tools/treasure_data.py) from EPT 1975 Secs. 1500-1920 and 2200. Do not edit by hand.\n"
    "export const TREASURE = " + js(data) + ";\n")

# ------------------------------------------------------------------ rules journal pages and rulings
def tbl(key, head=("Roll", "Result")):
    t, f, rows = T[key]
    return f"<h3>{t} ({f.replace('1d', 'd')})</h3>" + table(list(head), [[f"{lo}" if lo == hi else f"{lo}-{hi}", txt] for lo, hi, txt in rows])
LBL = {"copper": "Copper (1,000s)", "silver": "Silver (1,000s)", "gold": "Gold (1,000s)", "gems": "Gems", "jewelry": "Jewelry", "eyes": "Eyes", "arms": "Arms and armour", "misc": "Miscellaneous"}
hoard_html = (p("Each entry is number : percentage chance. Roll d100 for each column; if it is at or under the chance, roll the number (thousands of coins). The 'Roll Treasure' macro (Macros compendium) and the treasure buttons on creature sheets do all of this for you.") +
    table(["Type"] + [LBL[c] for c in COLS], [[k] + ["-" if c is None else f"{c[0]}: {c[1]}" for c in v] for k, v in HOARD.items()]) +
    "<h3>Gem value (d100), then d6: each 1 moves it up a category</h3>" + table(["Roll", "Káitars"], [[f"{lo}" if lo == hi else f"{lo}-{hi}", t] for lo, hi, t in T["gemBase"][2]]) +
    p("Categories above 50,000: 75,000, 100,000, 200,000, 300,000 and so on.") +
    "<h3>Jewelry value (d100), then d6: each 1 moves it up a row</h3>" + table(["Roll", "Káitars"], [[f"{lo}" if lo == hi else f"{lo}-{hi}", t] for lo, hi, t in T["jewelryBase"][2]]) +
    tbl("armsType") + tbl("miscType") +
    p("<b>Eyes:</b> d6 and d12: 1-2 = nos. 1-12, 3-4 = 13-24, 5-6 = 25-36 (Sec. 1310). <b>Books:</b> d6 and d12: 1-3 = nos. 1-12, 4-6 = 13-24."))
arms_html = (p("Only iron and steel can be enchanted, never Chlén-hide. Armour, helmet and shield pluses are added to the score needed to hit the wearer and do not change damage. If armour, helmet and shield differ, roll to see what is struck: about 5 in 6 the armour, 1 in 6 the helmet; a better shield is got up in time on 5-6 on d6. Weapons go to +3 (a few specials +4) on hitting chances; damage only when a damage plus is given. A temple priest of Karakán, Vimúhla, Chegárra or Chiténg may enchant iron or steel by +1 a week for d100 × 100 Káitars, sparingly.") +
    tbl("armourPlus") + tbl("swordPlus") + tbl("miscWeapon") +
    "<h2>Sec. 1810: swords, scimitars and battle-axes</h2>" + p("Picking up (or unsheathing) a weapon of the opposite alignment costs 2d6. A domineering weapon's owner saves vs. spells.") +
    tbl("weaponAlign") + tbl("weaponInt") + tbl("weaponEgo") + tbl("weaponEnemy") +
    "<h3>Weapon spells (Sec. 1820.4): d100 score for one, two or three spells</h3>" + table(["Weapon", "One", "Two", "Three"], [[f"+{k}", *v] for k, v in WEAPON_SPELLS.items()]) +
    "<h3>Each spell's group (d6)</h3>" + table(["Weapon", "Group I", "Group II", "Group III"], [["+1", "1-3", "4-5", "6"], ["+2", "1-2", "3-4", "5-6"], ["+3", "1", "2-4", "5-6"], ["+4", "-", "1-3", "4-6"]]) +
    p("Weapon spells are used once a day at the owner's direction (unless the weapon dominates him)."))
npc_html = (p("First-level characters have none. Warriors and Priests roll on the arms table (a Priest who gets a sword or edged weapon rolls again); everyone rolls on the devices table, but a Warrior first needs 14+ on d20. Both apply to nonhumans and intelligent 'animals' such as the Sérudla. Where 1-3 or 1-6 items are shown, roll d6.") +
    "<h3>Sec. 1910: magical arms and armour (d100)</h3>" + table(["Item(s)"] + [f"Level {b}" for b in BANDS], [[w] + [x or "-" for x in r] for w, r in NPC_ARMS]) +
    "<h3>Sec. 1920: magical devices (d100)</h3>" + table(["Item(s)"] + [f"Level {b}" for b in BANDS], [[w] + [x or "-" for x in r] for w, r in NPC_DEVICES]))
scroll_html = (p("Scrolls hold spells (Bonus Spells of Sec. 510 unless named). A spell is used once (10% it stays for a second use). 50% chance a scroll fades if not read at once. Temple priests read unknown scrolls for d100 × 10 per spell. For sale at a temple 15% of the time: d100 × 1,000 Káitars (Types I-V), × 5,000 (VI-VIII), × 10,000 (IX-XI); never a cursed scroll.") +
    tbl("scrollLang") + tbl("scrollModern") + tbl("scrollAncient") + tbl("scrollType") + tbl("scrollCurse") +
    "<h2>Books (Sec. 1700)</h2>" + p("Two to five copies of each exist. A reader who knows the language gets the effects at once; one who does not usually escapes them and cannot even identify the book. 80% of books stay to be read; 20% vanish if not read at once. The temple of Thúmis (good) or Ksárul (evil) reads one for d100 × 20 and may offer d100 × 100 or × 500 for it. Never for sale or loan. All 24 are in the Magic Items and Books compendium."))
extra_pages = [("Treasure (Sec. 2200)", hoard_html), ("Magical arms and armour (Secs. 1800-1820)", arms_html),
               ("Nonplayer characters' magic (Secs. 1910-1920)", npc_html), ("Scrolls and books (Secs. 1600-1700)", scroll_html)]
jd = docs["rules"][0]
for i, (n, html) in enumerate(extra_pages):
    pid = did("journal", n)
    jd["pages"].append({"_id": pid, "name": n, "type": "text", "title": {"show": True, "level": 1}, "text": {"content": html, "format": 1},
                        "sort": 350000 + i * 10000, "ownership": {"default": -1}, "flags": {}, "_key": f"!journal.pages!{jd['_id']}.{pid}"})
RULINGS = p(
 "<b>Treasure numbers:</b> EPT says to roll a d6 for the number of items. '1-3' is read as half a d6 rounded up; '2-12', '4-24' and '6-36' as 2, 4 or 6 d6; '1-100' as d100; '10-40' and '10-60' as d4 or d6 × 10.",
 "<b>Which amulet or miscellaneous magical item:</b> EPT gives no die. A d12 is used for the twelve amulets and a d24 for the 24 items (as for books).",
 "<b>Gems:</b> each gem is valued separately (EPT allows valuing groups of 5 or 10 when there are many). Jewelry already in the top row stays there.",
 "<b>Weapon spells (Sec. 1820.4):</b> the table is read as 'a d100 score at or above the number gives that many spells', so stronger weapons have more spells.",
 "<b>Weapon powers (Sec. 1810):</b> rolled for magic swords, scimitars and battle-axes, the weapons Sec. 1820 names.",
 "<b>NPC 'Sword and Dagger':</b> the dagger is one of the three dagger results of the miscellaneous weapon table, picked at random. A Priest who gets a sword or edged weapon rolls again; spears, bows and arrows count as edged, as on the weapon items.",
 "<b>The Treatise of Hrsh:</b> its d12 results overlap as printed (9-12, then 11 and 12); the text is kept as printed.")
for pg in jd["pages"]:
    if pg["name"] == "Table rulings in this system": pg["text"]["content"] += RULINGS
