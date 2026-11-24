"""
Builds compendium data for the Empire of the Petal Throne (Unofficial) system.
Outputs:
  src/packs/<pack>/<name>_<id>.json   one file per document, for @foundryvtt/foundryvtt-cli
  data/packs/<pack>.json              one array per pack, for the in-Foundry fallback loader
All text is short, plain-words summaries of mechanics (no book prose).
"""
import json, os, re, hashlib, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def did(*parts):
    h = hashlib.sha1("|".join(parts).encode()).hexdigest()
    alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    n = int(h, 16); out = ""
    for _ in range(16):
        out += alpha[n % 62]; n //= 62
    return out

def p(*paras):
    return "".join(f"<p>{x}</p>" for x in paras if x)

def item(pack, name, type_, img, system, sort=0):
    _id = did(pack, name)
    return {"_id": _id, "name": name, "type": type_, "img": img, "system": system, "effects": [],
            "folder": None, "sort": sort, "ownership": {"default": 0}, "flags": {}, "_key": f"!items!{_id}"}

EPT = "EPT 1975"
docs = {}

# ------------------------------------------------------------------ Skills
skills = []
G1 = ["Baker","Barber","Bootmaker","Bricklayer","Butcher","Carpenter","Carpet-maker","Cook","Dyer","Farmer","Fisherman","Glass-blower","Grocer","Mason","Merchant","Miner","Paper and ink maker","Perfumer","Potter","Rope and net maker","Sail maker","Tailor","Tanner","Weaver","Wine-maker"]
G2 = {
 "Animal-trainer":"Trains any creature not totally hostile to man in 1-3 months.",
 "Bird-trainer":"Trains any bird not totally hostile to man in 1-3 months.",
 "Fletcher (arrow maker)":"", "Hunter":"", "Jeweller-goldsmith":"", "Mountaineer":"", "Sailor":"",
 "Scribe-accountant":"",
 "Ship-builder":"Builds ships given men and tools: about a month for a small boat, six months for a large vessel.",
 "Ship-captain":"Sailing, cargoes, manifests and simple accounts.",
 "Slaver":"Judges the worth and strength of labourers and slaves.",
 "Smith-armourer":"Makes weapons and armour, including of Chlén-hide; can work raw iron into steel.",
 "Swimmer-diver":"",
 "Wheelwright (cart maker)":"Only artisan who builds Chlén carts and slave-drawn carts."}
G3 = {
 "Alchemist":("Recognises chemical compounds such as poisons and elixirs; may make them if the referee allows. Success uses the chance table by level.", True),
 "Artist-sculptor":("", False),
 "Assassin-spy-tracker":("Hides in shadows, passes unseen and tracks. Success uses the chance table by level.", True),
 "Astronomer-navigator":("Needed on any ship out of sight of land; operates the Tsolyáni compass.", False),
 "Author":("Writes records, histories or fiction; useful with the imperial bureaucracy.", False),
 "Botanist":("Recognises edible and poisonous plants. Success uses the chance table by level.", True),
 "Courtesan / Don Juan":("Charms a person of the opposite sex. Success uses the chance table by level.", True),
 "Dancer":("", False),
 "Engineer-architect":("Needed to build fortifications, palaces, roads and similar works.", False),
 "Geologist":("Recognises minerals in their raw state. Success uses the chance table by level.", True),
 "Interpreter":("Fluent in one modern or ancient human language besides Tsolyáni. Nonhuman tongues cannot be learned.", False),
 "Mathematician":("", False), "Musician":("", False),
 "Orator":("Sways a crowd. Success uses the chance table by level; failure may mean stoning for 3d6 damage.", True),
 "Physician":("Heals 2 hit points a day. A physician-priest adds 2 to Cure Light or Cure Serious Wounds (not to Eyes).", False),
 "Poet":("+5% to befriend, sway or convince hearers in courtly settings.", False),
 "Scholar":("History, philosophy, theology, literature; reads one extra ancient language.", False)}
for n in G1: skills.append(item("skills", n, "skill", "icons/svg/item-bag.svg", {"description": "", "source": f"{EPT} Sec. 420", "group": "plebeian", "rank": 0, "usesChanceTable": False, "language": ""}))
for n, d in G2.items(): skills.append(item("skills", n, "skill", "icons/svg/item-bag.svg", {"description": p(d), "source": f"{EPT} Sec. 420", "group": "skilled", "rank": 0, "usesChanceTable": False, "language": ""}))
for n, (d, ch) in G3.items(): skills.append(item("skills", n, "skill", "icons/svg/book.svg", {"description": p(d), "source": f"{EPT} Sec. 420", "group": "noble", "rank": 0, "usesChanceTable": ch, "language": ""}))
WAR = [("Spearman",""),("Mace/flail user",""),("Axeman",""),("Swordsman",""),("Slinger",""),("Bola-slinger",""),("Crossbowman",""),("Bowman",""),
       ("Broadsword and dagger man","Two blows per round at +1 to the score needed; no shield."),
       ("Sapper","Mining, battering rams and earthworks."),("Catapult-artilleryman","Builds and uses onagers, ballistae, mangonels and trebuchets."),
       ("Strategist","Plans campaigns, organises expeditions and directs battles.")]
for i, (n, d) in enumerate(WAR, 1):
    skills.append(item("skills", n, "skill", "icons/svg/sword.svg", {"description": p(d, "Warrior skills are gained in this order (Sec. 430)."), "source": f"{EPT} Sec. 430-431", "group": "warrior", "rank": i, "usesChanceTable": False, "language": ""}, i))
skills.append(item("skills", "Knows two modern languages", "skill", "icons/svg/book.svg", {"description": p("Two modern human languages (Tsolyáni is assumed for a Tsolyáni)."), "source": f"{EPT} Sec. 432", "group": "priest", "rank": 1, "usesChanceTable": False, "language": ""}, 1))
skills.append(item("skills", "Knows two ancient languages", "skill", "icons/svg/book.svg", {"description": p("Two ancient languages, important for scrolls, books and maps."), "source": f"{EPT} Sec. 432", "group": "priest", "rank": 2, "usesChanceTable": False, "language": ""}, 2))
skills.append(item("skills", "Astrologer", "skill", "icons/svg/sun.svg", {"description": p("Casts a horoscope in one turn with astrolabe and tables: reveals character and motives infallibly; predicts 1 turn ahead 70%, 2 turns 50%, 3 turns 30%. Usable repeatedly.", "Magic User skill no. 6 in order."), "source": f"{EPT} Sec. 433", "group": "magicUser", "rank": 6, "usesChanceTable": False, "language": ""}, 6))
docs["skills"] = skills

# ------------------------------------------------------------------ Spells
def spell(name, kind, group, rank, prof, uses, period="day", rng="", dur="", tgt="none", save="", dmg="", minlvl=0, wait="", desc="", unlimited=False, src=""):
    return item("spells", name, "spell", {"I":"icons/svg/aura.svg"}.get("I"), {
        "description": p(desc), "source": src, "kind": kind, "profession": prof, "group": group, "rank": rank,
        "uses": {"value": uses, "max": uses, "period": period}, "unlimited": unlimited,
        "range": rng, "duration": dur, "targeting": tgt, "save": save, "damage": dmg, "minLevel": minlvl, "waitAfter": wait}, rank)
S = []
PS = f"{EPT} Sec. 432"; MS = f"{EPT} Sec. 433"
S += [
 spell("Produce Light","professional",0,3,"priest",1,rng="30 ft radius",dur="10 turns",desc="A soft radiance around the user.",src=PS),
 spell("Detect Evil/Good","professional",0,4,"priest",1,dur="2 turns",desc="Warns of hostile alignment in objects or adjoining rooms; not on persons or creatures; does not say what the danger is. Detects hostile magic in a charged object.",src=PS),
 spell("Cure Light Wounds","professional",0,5,"priest",1,desc="Restores 1d6 lost hit points to any being. Not for radiation damage.",src=PS),
 spell("ESP","professional",0,6,"priest",3,rng="20 ft",dur="2 turns",desc="Detects the thoughts of living beings (not undead or automatons) in adjoining rooms. Nonhuman thought comes through only as garble.",src=PS),
 spell("Telepathy","professional",0,7,"priest",3,rng="240 ft",dur="1 turn",desc="Two-way silent speech with one character; useless without a shared language.",src=PS),
 spell("Protection from Evil/Good (Priest)","professional",0,8,"priest",1,rng="10-ft circle",dur="3 turns",desc="Undead cannot enter; +1 to all saving throws; attackers' damage -2.",src=PS),
 spell("Cure Serious Wounds","professional",0,9,"priest",1,desc="Restores 2d6 lost hit points. Placed 9th following the spell descriptions; the skill table in Sec. 430 does not list it.",src=PS),
 spell("Control Person (Priest)","professional",0,10,"priest",1,rng="50 ft",dur="3 turns",save="vs. Spells",desc="Controls 1-6 persons or intelligent nonhumans (not animals, Underworld creatures or automatons). No effect above 7th level.",src=PS),
 spell("Remove Curse","professional",0,11,"priest",1,desc="Lifts curses, changes the alignment of magical weapons, restores magically changed beings and objects, cures magical madness. One person or object.",src=PS),
 spell("Revivify","professional",0,12,"priest",1,period="week",desc="Restores a slain human or intelligent nonhuman within one week of death, by the subject's Constitution chance. No fighting for a week. Once a week at level VIII or below; once a day above VIII.",src=PS),
 spell("Control of Self","professional",0,1,"magicUser",2,desc="Total control of one's own body: hold breath, stop heartbeat, iron grip, trance, perfect recall. Broken only by very powerful magic or a being of 9+ hit dice.",src=MS),
 spell("Illusion","professional",0,2,"magicUser",1,dur="3 turns",desc="Illusions about the user only. Believed 60% by nonintelligent creatures, 40% by intelligent ones, never by automatons. Damage from a believed illusion is real. Must be seen to work.",src=MS),
 spell("Clairaudience","professional",0,3,"magicUser",3,rng="20 ft",dur="2 turns",desc="Hear what happens in an adjoining room.",src=MS),
 spell("Clairvoyance","professional",0,4,"magicUser",3,rng="20 ft",dur="2 turns",desc="See an adjoining room or space.",src=MS),
 spell("Telekinesis","professional",0,5,"magicUser",2,rng="10 ft per level",tgt="aimed",desc="Moves solid objects through air or water: 1 ounce and 10 ft per level. Can stun an unarmoured man on a hit but not kill. Cannot move edged weapons or missiles.",src=MS),
 spell("Medium","professional",0,7,"magicUser",3,desc="Speak with the dead, spirits, and distant living beings (over five miles away).",src=MS),
 spell("Nature Control","professional",0,8,"magicUser",1,rng="50 ft",dur="3 turns",save="animals vs. Spells",desc="Controls 1d12 animals or plants. Not nonhumans, Underworld creatures or undead.",src=MS),
 spell("Control Person (Magic User)","professional",0,9,"magicUser",1,rng="50 ft",dur="3 turns",save="vs. Spells",desc="As the priestly spell: 1-6 persons, no effect above 7th level.",src=MS),
 spell("Necromancy","professional",0,10,"magicUser",1,rng="30 ft",dur="6 turns",save="undead over 3 HD",desc="Controls 1d12 undead, or makes a zombie from a dead being that obeys for six turns.",src=MS),
 spell("Control Underworld Creatures","professional",0,11,"magicUser",1,rng="30 ft",dur="6 turns",save="creatures over 3 HD",desc="Controls 1-6 Underworld creatures; not humans, intelligent nonhumans or undead.",src=MS),
 spell("The Grey Hand","professional",0,12,"magicUser",1,rng="touch",tgt="aimed",desc="Instant death, no saving throw, on a hit by touch (risking a dying blow). Revival possible at -10% Constitution chance; no strenuous action for a week.",src=MS),
]
B = f"{EPT} Sec. 510"
g1 = [
 ("Calm","","", "none","","", "Calms walls of Wind or Water, storms, and rioting mobs of first-level beings."),
 ("Create Food and Drink","","", "none","","", "Rations for 1d10 persons."),
 ("Creatures (Group I)","","3 turns","none","","", "Creates 1-3 one-hit-die beasts, warriors, crawlers, flyers or undead that serve the caster, then vanish.", "Levels I-V: one week before any other spell; VI-VIII: two days; IX+: none (once a day)."),
 ("Curse/Bless","","","none","","", "1-6 beings get +1 morale and +1 to hit, or 1-6 enemies get -1 to hit."),
 ("Disbelieve and Dispel","10 ft","","none","","", "Dispels an oncoming illusion if there is time before it arrives."),
 ("Dispel Evil/Good","20 ft","3 turns","none","","", "Dispels an opposing good or evil spell operating within range."),
 ("Door Control","","3 turns","none","","", "Opens or closes a normal-sized door and holds it; broken only by another Door Control."),
 ("Fear","20 ft","","aimed","vs. Spells","", "One opponent panics and flees defenceless. Takes two rounds to arrive; a Dispel Evil can stop it. Write the casting down when cast."),
 ("Heal Minor Wounds","","","none","","", "Heals 1d6 lost hit points, never above the original total."),
 ("Levitate","self","2 turns","none","","", "Rise up to 60 ft per turn to a maximum of 120 ft, vertical only, soft landing at the end."),
 ("Light","30-ft area","5 turns","none","","", "Daylight. Negates the chance of surprise."),
 ("Locate Gold and Gems","10 ft","2 turns","none","","", "Feels gold and gems even if buried or invisible."),
 ("Locate Objects","200 ft","5 turns","none","","", "Homes in on a familiar object the user has handled. Not outdoors."),
 ("Madness","30 ft","permanent","aimed","vs. Spells","", "Victim goes permanently insane. Blocked by Control of Self; cured by Remove Curse."),
 ("Plague","30 ft","","aimed","","", "Victim dies at the start of the next round or turn unless Cure Disease is cast. Revival costs 5 extra Constitution."),
 ("Protection from Evil/Good","5-ft radius","2 turns","none","","", "Protects the user and 1-6 companions from undead, apparitions and Control Person. Not from weapons or Eyes."),
 ("Shadows","30 ft","3 turns","area","vs. Spells (each)","", "Opponents who fail are blind for one turn, unable to attack or defend. Dispelled by Light cast at the start of the next round."),
 ("Seeing Other Planes","20 ft","2 turns","none","","", "See other planes, invisible things and dimensional doors. Cast within 10 ft the user may cast again next round; 11-20 ft, not."),
]
g2 = [
 ("Charm Creature","120 ft","3 turns","aimed","see text","", "Charms an animal, nonhuman or Underworld creature (not automatons). Equal or more HD than caster: normal save. 1-2 HD fewer: save only on a prior 60+ on d100; 3-4 fewer: 75+; 5-6 fewer: 85+; 7+ fewer: no save."),
 ("Cold","20 ft","","area","vs. Spells","5d6", "Hits 1-3 beings (d6: 1-2 one, 3-4 two, 5-6 three) for 5d6."),
 ("Creatures (Group II)","","3 turns","none","","", "Creates 1-2 three-hit-dice beings that serve the caster.", "Cannot be cast at levels I-III. IV-VI: one week before any other spell; VII-VIII: two days; IX: one day; above IX: none."),
 ("Cure Disease","","","none","","", "Cures any disease instantly in one person; 75% on a nonhuman or animal. Does not heal wounds."),
 ("Dispel Magic","120 ft","2 turns","none","","", "Suspends many spells (e.g. Mind-Bar, Petrification), amulet powers and weapon or armour enchantments. No effect on Eyes or ancient devices."),
 ("Extra-Vision","120 ft","3 turns","none","","", "See through solids."),
 ("The Hands of Krá the Mighty","120 ft","","aimed","vs. Spells","(1d6)d6", "Grapples and crushes: on a failed save, roll 1d6 for the number of d6 of damage."),
 ("Heal Serious Wounds","","","none","","", "Heals 2d6 lost hit points, never above the original total."),
 ("Invisibility","","3 turns","none","","", "1-6 beings including the user become invisible: +3 to their saving throws, +2 to the score needed to hit them."),
 ("Neutralise Poison","","","none","","", "Counts as a successful save against poison, bites or stings; full health restored."),
 ("Paralysis","30 ft","1 turn","aimed","vs. Paralysis","", "One enemy is paralysed. It saves again next turn or the paralysis becomes permanent (only the Eye of Healing removes it)."),
 ("Petrification","30 ft","permanent","aimed","vs. Spells","", "Turns the victim to stone; removed by Remove Curse or Dispel Magic. A failed save also costs one hit die permanently."),
 ("Sleep","100 ft","8 hours","area","","", "2d6 beings of levels I-III, or 1d6 of levels IV-V; none of VI+. Not automatons, androids, undead, animals or Ahoggyá."),
 ("Slow/Haste","30 ft","3 turns","area","","", "1d12 beings move at half or double speed (two blows a round, or one every other round). Only once on the same beings."),
 ("Transmutation","120 ft","12 turns","none","","", "Changes a 20 x 20 ft open, flat area of earth, stone, water or mud into another form of the same substance; mud costs 90% of movement."),
 ("The Vapour of Death","100 ft","","area","vs. Poison","1d6", "Visible poison cloud 50 x 50 ft, moving 10 ft a turn with the wind. Failed save: dead unless Neutralise Poison is cast at once. Made save: 1d6."),
 ("Withering","60 ft","permanent","aimed","vs. Spells","2d6", "Withers limbs (d6: 1 left arm, 2 right arm, 3 left leg, 4 right leg, 5 both arms or legs, 6 one arm and one leg). Only the Eye of Regeneration restores. Even on a save, Cure Disease, Neutralise Poison or Remove Curse is needed at once or 2d6 damage."),
 ("Zoomorphy","30 ft","permanent","area","vs. Spells","", "Magic Users only. 1-6 opponents behave as an animal the caster knows (without its form or hit dice), until an Eye of Transformation."),
]
g3 = [
 ("Apparitions","240 ft","6 turns","none","","", "1-3 illusions. Opponents roll d100: 1-30 believe (damage real), 31-60 dubious (40% chance damage is real), 61-100 disbelieve."),
 ("Change Self or Others","30 ft","permanent","area","vs. Spells","", "User and 1-6 others take any animal, insect, nonhuman or human form (not a specific person). Undone by Remove Curse. Changed casters cannot cast. Blocked by Control of Self."),
 ("Control Terrain","20 ft","6 turns","none","","", "Makes a 10-ft tunnel, wall or boulder in natural earth or stone only."),
 ("Creatures (Group III)","","3 turns","none","","", "One very powerful 5-hit-dice being serves the caster.", "Cannot be cast at levels I-VI. VII-VIII: one week before any other spell; IX: two days; above IX: one day; XII+: once a day freely."),
 ("The Demon","","6 turns","none","","", "A large demon with 7 hit dice and flying speed serves the caster.", "Cannot be cast at levels I-VIII. IX-X: one week before any other spell; XI-XIII: two days; above XIII: one day."),
 ("Doomkill","240 ft","","area","see text","2d6", "Roll 2d6 for aim: 7-9 on target, under 7 short, over 9 long; a 2 catches the caster. Blast radius 30 ft. Save 17+ (levels I-IV), 15+ (V-VII), 13+ (higher) or die; a save still takes 2d6."),
 ("Enchanted Armour and Weapons","","permanent","none","","", "Enchants an unenchanted steel weapon, helmet, shield or armour: d6 1-3 +1, 4-5 +2, 6 +3. Affects hit or defence only, not damage."),
 ("The Energy Bolt","120 ft","","area","vs. Spells","1d6", "Lightning hits 1d12 beings. Even a successful save takes 1d6. The 1975 text does not state the effect of a failed save: referee's ruling."),
 ("Fly","self or one companion","3 turns","none","","", "Fly at 120 ft a turn with up to 250 lb extra, rising to 180 ft."),
 ("The Infernal Barrier","","3 turns","none","","", "A glittering wall before the user: enemies pass only on 18+ on d20; +2 to the score needed to hit the user; 75% to stop Cold or the Eye of Frigid Breath; stops walls of water and ice."),
 ("Invulnerability","","2 turns","none","","", "Immune to Chlén-hide and ordinary steel weapons and non-magical missiles. If already active, also proof against Doomkill, the Silver Halo and Telekinesis."),
 ("Mind-Bar","120 ft","12 turns","aimed","vs. Spells","", "Makes one being do or refrain from an action. No effect on level VI+."),
 ("Quest","30 ft","until done","area","vs. Spells","", "Sends 1d12 beings on a quest; released by Dispel Magic or Remove Curse."),
 ("Raise the Dead","10 ft","12 turns","none","","", "Animates 2d6 dead beings as obedient zombies with their old hit dice; they hit at -2 and deal -3 damage."),
 ("Reincarnation","10 ft","permanent","none","none","", "Reincarnates one dead being in another form, keeping its hit dice. Undone by Dispel Magic (still dead)."),
 ("Research","","","none","","", "Allows the character to research a new spell under terms the referee sets. Only possible if this spell is taken."),
 ("Sending of Evil","240 ft","","area","none","", "Disease and plague on 2d6 beings; they die within two turns unless Cure Disease is cast."),
 ("Shield of Defense","20 ft","2 turns","none","","", "User and 1-6 companions are protected from missiles, the Energy Bolt, the Hands of Krá and Telekinesis, and from creatures and soldiers of levels I-III."),
 ("The Silver Halo of Soul Stealing","30 ft","permanent","aimed","vs. Spells","", "Takes one being's soul. Only Dispel Magic restores it (60%). Deflected by Invulnerability or Dispel Evil/Good, with 25% to strike someone nearby."),
 ("Teleportation","360 ft","","none","","", "User and 1d12 beings go to a place the user knows. Beyond range: 25% safe; otherwise 50% lost forever, 30% elsewhere on Tékumel, 20% on another planet."),
 ("Walls","","","none","vs. Spells","", "Send one wall a day: Fire, Ice, Stone, Swords, Tanglevines, Water or Wind. Each has its own speed, range, and interactions (Sec. 510 no. 21). Walls have 2d6 hit points and fight other walls on 15+."),
 ("Weather Control","240 ft","6 turns","none","","", "Rain, storm, snow or sun, outdoors only. Ended by Dispel Magic; damage at the referee's option."),
 ("Wish","","","none","","", "A limited wish granted within the referee's bounds. Once per week.", ""),
]
for gnum, lst in ((1, g1), (2, g2), (3, g3)):
    for i, row in enumerate(lst, 1):
        name, rng, dur, tgt, save, dmg, desc = row[:7]
        wait = row[7] if len(row) > 7 else ""
        minlvl = {"Creatures (Group II)": 4, "Creatures (Group III)": 7, "The Demon": 9}.get(name, 0)
        prof = "magicUser" if name == "Zoomorphy" else ""
        period = "week" if name == "Wish" else "day"
        S.append(spell(name, "bonus", gnum, i, prof, 1, period=period, rng=rng, dur=dur, tgt=tgt, save=save, dmg=dmg, minlvl=minlvl, wait=wait, desc=desc, src=f"{B}, Group {'I'*gnum}"))
for s in S:
    s["img"] = "icons/svg/aura.svg" if s["system"]["kind"] == "bonus" else ("icons/svg/sun.svg" if s["system"]["profession"] == "priest" else "icons/svg/daze.svg")
docs["spells"] = S

# ------------------------------------------------------------------ Eyes
E = f"{EPT} Sec. 1310"
eyes = [
 ("The Abominable Eye of Detestation","40 ft","1 turn","area","vs. Eyes","", "1d12 beings flee in horror; good against undead. Cornered victims fight at +2 needed to hit and -2 damage."),
 ("The Excellent Ruby Eye","50 ft","until released","area","vs. Eyes","", "Freezes 1-6 beings in time. Another charge releases a victim. Fairly common."),
 ("The Eye of Advancing Through Portals","10 ft","","aimed","vs. Eyes","", "Opens any door, blasts 10 ft of rock, or bores a 10-ft tunnel. A person struck dies unless he saves."),
 ("The Eye of Aerial Excellence","5-ft radius","4 turns per charge","none","unwilling: vs. Eyes","", "User and 1d12 companions fly up to 300 ft a turn."),
 ("The Eye of Allseeing Wonder","120 ft","1 turn per charge","none","","", "A one-foot beam reveals invisible objects, beings and dimensional doors; also gives light."),
 ("The Eye of Being an Unimpeachable Shield Against Foes","","2 turns","none","","", "Up to 1d4 beings are immune to all edged and blunt weapons, magical or not. No protection from spells or devices."),
 ("The Eye of Bestowing Life","","","none","","", "Revives a being slain within three weeks from any fragment. On 91-100 on d100, no Constitution is lost. Rare; never for sale."),
 ("The Eye of Calling Forth an Unconquerable Army","","2 turns","none","","", "Up to 1d100 automatons per charge: AC 2, 3+1 HD, move 9, sword and shield. Fighters only."),
 ("The Eye of the Creeping Fog of Doom","","4 turns","area","","", "A gas cloud 100 ft square moving 60 ft a turn: 50% nerve gas, 40% contact gas, 10% harmless. Needs 140 ft of open space; watch the wind."),
 ("The Eye of Departing in Safety","300 ft","","none","","", "Carries the user and 1d12 beings to a preset place. Used without a destination, it carries them into darkness forever."),
 ("The Eye of Exquisite Power Over Maidens","60 ft","until released","aimed","vs. Eyes","", "Charms one human of the opposite sex until another charge releases them. Nonhumans unaffected."),
 ("The Eye of Frigid Breath","120 ft","","area","vs. Eyes","", "Cone of cold: at 30 ft one being, 60 ft 1-6, 100 ft 1d12. A failed save is death. Passes through intervening beings."),
 ("The Eye of Hastening Destiny","5-ft radius","2 turns","none","","", "User and 1-6 companions move at triple speed: three blows a round."),
 ("The Eye of Illuminating Glory","30 ft","10 turns","none","","", "Soft light that can be capped and reopened. Does not negate surprise. Common."),
 ("The Eye of Incomparable Understanding","30 ft","4 turns","none","","", "Translates any spoken human or nonhuman language, both ways."),
 ("The Eye of Indefinable Apprehension","40 ft","3 turns","area","vs. Eyes","", "Panic: 1d100 beings of levels I-III, 1-6 of IV-VII, one of VIII+. Not automatons, undead or supernatural Underworld creatures."),
 ("The Eye of Insubstantial Visioning","40 ft","2 turns","area","","", "Illusions believed by humans of levels I-VI 60%, nonhumans I-IV 40%, animals and creatures under 5 HD 70%. Believed damage is real."),
 ("The Eye of Joyful Sitting Amongst Friends","20 ft","4 turns","area","vs. Eyes","", "1-3 human or nonhuman enemies become devoted friends."),
 ("The Eye of Madness","40 ft","permanent","area","vs. Eyes","", "1d12 humans, nonhumans or animals go mad until healed by Heal Serious Wounds or the Ineluctable Eye of Healing."),
 ("The Eye of Non-Seeing","10-ft radius","3 turns","none","","", "1-6 beings turn invisible and may fight: +3 to saves against aimed devices, +2 to the score needed to hit them."),
 ("The Eye of Opening the Way","20 ft","2 turns","none","","", "Finds and opens secret doors; buzzes within a foot of a trap."),
 ("The Eye of Raising an Infernal Barrier","20 ft ahead","2 turns","area","vs. Eyes","3d6", "A wall of flame 10 ft high and up to 30 ft wide. Beings 20-30 ft away save to jump clear or take 3d6. Needs 20 ft clear."),
 ("The Eye of Regeneration","","2 turns","none","","", "Regrows a lost limb or organ; one charge per limb. Does not raise the dead."),
 ("The Eye of Retaining All Things","","","none","","", "Stores up to 100,000 Káitars of weight in an airless void; no living beings. Another charge brings things back."),
 ("The Eye of Retarding Destiny","30 ft","2 turns","area","vs. Eyes","", "1d12 beings slowed to one-third speed."),
 ("The Eye of Returning Unto Darkness","20 ft","2 turns","area","vs. Eyes","", "Total darkness on the user and 1-6 others (+3 to hit them, they cannot fight), or on an enemy group as a weapon."),
 ("The Eye of Rising Above All","20 ft","5 turns","none","","", "Rise 240 ft straight up, or lift up to 1,000 lb and tow it."),
 ("The Eye of Ruling as a King in Glory","120 ft","10 turns","area","vs. Eyes","", "10-1,000 humans and nonhumans of levels I-II obey the user. Smashing the Eye ends it."),
 ("The Eye of Strengthening the Majesty of Weapons","","permanent","none","","", "Each charge adds +1 to an edged steel weapon (max +3) or to blunt weapons, armour or shields (max +2)."),
 ("The Eye of Transformation","10 ft","permanent","aimed","vs. Eyes","", "Reverses the alignment of one human or intelligent nonhuman. Undone by another charge."),
 ("The Eye of Triumphant Passage Through Infernos","self","2 turns","none","","", "User passes unharmed through walls of fire and infernal barriers."),
 ("The Incomparable Eye of Command","30 ft","2 turns","area","16+ (I-IV), 13+ (V-VIII), 10+ (IX+)","", "Controls 1d12 beings, who obey without will."),
 ("The Ineluctable Eye of Healing","10 ft","","none","","2d6", "Cures disease and heals 2d6 per charge, one being per charge. Used first, it replaces a save against disease or poison."),
 ("The Splendid Eye of Krá the Mighty","arm's reach / 5 ft","","aimed","vs. Eyes","4d6", "Pulls or pushes up to 1,000 lb or walls 3 ft thick; as a weapon 4d6 within arm's reach (save to dodge)."),
 ("The Terrible Eye of Raging Power","100 ft","","area","vs. Eyes","4d6", "Lightning in a 10-ft circle hits 1-10 beings in the first three ranks for 4d6. Needs 100 ft or rebounds on the user."),
 ("The Thoroughly Useful Eye","","","none","","", "Recharges another Eye by one charge a day; never needs recharging itself. Rarest of all; never for sale."),
]
E_list = []
for i, (n, rng, dur, tgt, save, dmg, desc) in enumerate(eyes, 1):
    rarity = "rare" if n in ("The Eye of Bestowing Life", "The Thoroughly Useful Eye") else ("common" if n in ("The Excellent Ruby Eye", "The Eye of Illuminating Glory", "The Eye of Frigid Breath") else "")
    E_list.append(item("eyes", n, "eye", "icons/svg/eye.svg", {
        "description": p(desc, "When found, the referee rolls d100 for charges; 5% of Eyes are defective (Sec. 1300)."),
        "source": f"{E} no. {i}", "cost": 0, "weight": 0, "quantity": 1,
        "charges": {"value": 0, "max": 100}, "dial": False, "identified": True, "inscription": "",
        "range": rng, "duration": dur, "targeting": tgt, "save": save, "damage": dmg, "rarity": rarity}, i))
docs["eyes"] = E_list

# ------------------------------------------------------------------ Amulets
A = f"{EPT} Sec. 1400"
amulets = [
 ("The Amulet Against the Iniquitous Nshé", "", "Read aloud in the Tsáqw tongue, makes an Nshé not in man-form retreat (70% it flows around to attack others; keep 20 ft away)."),
 ("The Amulet of Finding Treasure in the Underworld", "300 ft", "Single use: guides the user to the nearest Underworld treasure hoard, then crumbles."),
 ("The Amulet of the Good God", "30 ft", "Hrá retreat 90% unless meleed; other undead flee 50%. Lasts four turns. Good characters only; an evil one touching it takes 1d6 d6."),
 ("The Amulet of Invincible Steel", "", "Protects carried steel from the secretions of the Ngáyu."),
 ("The Amulet of Mastery Over Rényu", "", "Controls 1-3 Rényu; each saves on 13+ on d20."),
 ("The Amulet of Perceiving the Scintillation of Metals", "20 ft", "Points to the largest metal hoard in range for two turns. Charges rolled on d100."),
 ("The Amulet of Peace Amongst the Servers of Ksárul", "20 ft", "For three turns Hrá, Mrúr and Qól stop fighting the holder; Biridlú, Marashyálu and Tsú'uru 20%. Charges rolled on d100."),
 ("The Amulet of Power Over the Undead", "30 ft", "Vorodlá, Tsóggu, Hrá, Hurú'u, Mrúr and Shédra retreat 80%. Magic Users only. Once per group of undead; no charge limit."),
 ("The Amulet of Protection Against the Grey Hand", "", "Wearer is immune to the Grey Hand. Loses its power if sold or traded while its wearer lives."),
 ("The Amulet of Ruling the Ru'ún", "20 ft", "Controls 1-4 Ru'ún for two turns (save 13+ on d20). Only usable by one who knows Llyáni."),
 ("The Amulet of Safety Amidst Putrefaction", "", "Wearer and 1-6 comrades move unharmed among the Shunned Ones for four turns. Charges rolled on d100."),
 ("The Amulet of Warding Off Thúnru'u", "30 ft", "1-6 Thúnru'u flee for two turns (they fight if meleed). No save; once per group."),
]
docs["amulets"] = [item("amulets", n, "magicItem", "icons/svg/aura.svg", {"description": p(d), "source": f"{A} no. {i}", "cost": 0, "weight": 0, "quantity": 1,
    "category": "amulet", "uses": {"value": 0, "max": 0}, "range": r, "duration": "", "save": "", "alignmentRestriction": "good" if "Good God" in n else "", "equipped": False}, i)
    for i, (n, r, d) in enumerate(amulets, 1)]

# ------------------------------------------------------------------ Equipment (weapons, armour, gear)
EQ = f"{EPT} Sec. 910-920"
def weapon(name, cost, wt, die="d6", plus=0, cat="melee", minstr=0, edged=True, rng=(0,0,0), extra=None, note=""):
    sysd = {"description": p(note), "source": EQ, "cost": cost, "weight": wt, "quantity": 1, "category": cat, "material": "chlen",
            "die": die, "damagePlus": plus, "magic": 0, "minStr": minstr, "twoHanded": False, "noShield": False, "edged": edged,
            "extraBlow": False, "everyOtherRound": False, "range": {"close": rng[0], "medium": rng[1], "long": rng[2]}, "fixedDamage": "", "equipped": False}
    sysd.update(extra or {})
    return item("equipment", name, "weapon", "icons/svg/sword.svg", sysd)
STRNOTE = "Needs Strength over 80 (Sec. 721)."
PROP = "Range bands set in proportion to the bow bands, as Sec. 722 directs."
W = [
 weapon("Sword (Chlén-hide)", 10, 650),
 weapon("Dagger (Chlén-hide)", 5, 225, die="d4", rng=(17, 75, 100), note="Can be thrown about 100 ft; a thrown dagger gets no damage bonuses (Sec. 730). Magic Users may use only daggers."),
 weapon("Scimitar (Chlén-hide)", 9, 0, note="Weight not listed in the 1975 encumbrance table."),
 weapon("Battleaxe (Chlén-hide)", 12, 1100, plus=1, minstr=81, note=STRNOTE),
 weapon("Flail (Chlén-hide)", 8, 1100, plus=1, minstr=81, edged=False, note=STRNOTE),
 weapon("Morning Star (Chlén-hide)", 8, 1100, plus=1, minstr=81, edged=False, note=STRNOTE),
 weapon("Mace (Chlén-hide)", 7, 0, plus=1, minstr=81, edged=False, note=STRNOTE + " Weight not listed in the 1975 encumbrance table."),
 weapon("Spear (Chlén-hide)", 5, 0, note="Weight not listed in the 1975 encumbrance table."),
 weapon("Pike, 10 ft (Chlén-hide)", 8, 1900, plus=1, minstr=81, note=STRNOTE),
 weapon("Halberd, 8 ft (Chlén-hide)", 8, 1900, plus=1, minstr=81, note=STRNOTE),
 weapon("Poleaxe (Chlén-hide)", 9, 1900, plus=1, minstr=81, note=STRNOTE),
 weapon("Two-handed Sword (Chlén-hide)", 15, 1900, plus=2, minstr=90, extra={"twoHanded": True, "noShield": True}, note="The great broadsword of N'lüss: Strength 90+, no shield, one fighter per 10-ft space."),
 weapon("Javelin (Chlén-hide)", 4, 0, cat="thrown", rng=(17, 75, 100), note="Thrown about 100 ft. " + PROP),
 weapon("Longbow (Séresh-wood)", 30, 0, cat="missile", edged=True, rng=(100, 450, 600)),
 weapon("Composite Bow", 50, 0, cat="missile", rng=(100, 450, 700), note="The text gives a maximum of about 650-700 ft; 700 is used."),
 weapon("Light Crossbow", 20, 0, cat="missile", rng=(100, 400, 550)),
 weapon("Heavy Crossbow", 40, 0, cat="missile", rng=(100, 500, 750), extra={"everyOtherRound": True}, note="Fires every other combat round."),
 weapon("Sling", 3, 0, cat="missile", edged=False, rng=(50, 225, 300), note="The rules give no separate sling damage; 1d6 follows the general rule that most weapons do one six-sided die. Set 1d4 if your table counts sling stones as light missiles. " + PROP),
 weapon("Staff-sling", 8, 0, cat="missile", edged=False, rng=(100, 450, 600), note="Range 550-600 ft in the text; 600 used. Damage as for the Sling. " + PROP),
 weapon("Bolas", 2, 0, cat="thrown", edged=False, rng=(20, 90, 120), note="Thrown up to about 120 ft to wrap and bring down a foe. Damage is not given separately; adjust to taste. " + PROP),
 weapon("Ballista", 400, 0, cat="siege", rng=(400, 850, 1200), extra={"fixedDamage": "5d6", "everyOtherRound": True}, note="5d6 on a hit; 1d6 men in a column may be spitted. Only +3 magical armour stops it (still 1d6). No hit bonuses with siege engines."),
]

STEEL = "The 1975 encumbrance table gives this steel weight but the price list has no price: metal arms are rare and sold only now and then at armourers in the foreigners' quarter (Sec. 910). Set the price with the referee."
for nm, base, wt in [("Sword", "Sword (Chlén-hide)", 900), ("Dagger", "Dagger (Chlén-hide)", 325), ("Battleaxe", "Battleaxe (Chlén-hide)", 1700),
                     ("Flail", "Flail (Chlén-hide)", 1700), ("Morning Star", "Morning Star (Chlén-hide)", 1700),
                     ("Pike, 10 ft", "Pike, 10 ft (Chlén-hide)", 2600), ("Halberd, 8 ft", "Halberd, 8 ft (Chlén-hide)", 2600),
                     ("Poleaxe", "Poleaxe (Chlén-hide)", 2600), ("Two-handed Sword", "Two-handed Sword (Chlén-hide)", 2600)]:
    src = next(w for w in W if w["name"] == base)
    sysd = json.loads(json.dumps(src["system"]))
    sysd.update({"material": "steel", "cost": 0, "weight": wt, "description": p((sysd["description"].replace("<p>","").replace("</p>"," ").strip() + " " if sysd["description"] else "") + STEEL)})
    W.append(item("equipment", f"{nm} (iron or steel)", "weapon", "icons/svg/sword.svg", sysd))
AR = []
def armour(name, cost, wt, t, mat, note=""):
    return item("equipment", name, "armour", "icons/svg/shield.svg", {"description": p(note), "source": EQ, "cost": cost, "weight": wt, "quantity": 1, "armourType": t, "material": mat, "magic": 0, "equipped": False})
AR = [
 armour("Leather Armour (Vringálu-hide)", 30, 4324, "leather", "other"),
 armour("Chainmail (Chlén-hide)", 40, 6500, "chain", "chlen"),
 armour("Plate Armour (Chlén-hide)", 50, 9000, "plate", "chlen"),
 armour("Helmet (Chlén-hide)", 13, 600, "helmet", "chlen"),
 armour("Shield (Chlén-hide)", 10, 1200, "shield", "chlen"),
 armour("Chainmail (iron or steel)", 0, 8650, "chain", "steel", "No price in the 1975 list; metal is rare and costly on Tékumel."),
 armour("Plate Armour (iron or steel)", 0, 13000, "plate", "steel", "No price in the 1975 list; metal is rare and costly on Tékumel."),
 armour("Helmet (iron or steel)", 0, 865, "helmet", "steel", "No price in the 1975 list."),
 armour("Shield (iron or steel)", 0, 2000, "shield", "steel", "No price in the 1975 list. Plate with a steel shield is Armour Class 1."),
]
def gear(name, cost, wt=0, cat="gear", note=""):
    return item("equipment", name, "equipment", "icons/svg/item-bag.svg", {"description": p(note), "source": EQ, "cost": cost, "weight": wt, "quantity": 1, "category": cat, "uses": {"value": 0, "max": 0}, "equipped": False})
MISC = "Miscellaneous equipment counts 1,500 Káitars of weight (Sec. 920)."
G = [
 gear("Rope, 50 ft", 3, 1500, note=MISC), gear("Pole, 10 ft", 1, 1500, note=MISC), gear("20 Chlén-hide Spikes and Mallet", 4, 1500, note=MISC),
 gear("Small Sack (1,500 K capacity)", 1), gear("Large Sack (6,000 K capacity)", 3), gear("Backpack (6,000 K capacity)", 5),
 gear("Waterskin", 1, 500), gear("10 Resin Torches", 2), gear("Lantern", 5), gear("Flask of Oil", 1), gear("Flint, Steel and Tinder", 3),
 gear("Compass", 50, note="Only an astronomer-navigator can use the Tsolyáni compass."), gear("Charting Paper, Pens and Ink", 3),
 gear("Heavy Outdoors Boots", 15, cat="clothing"), gear("Mallet and 5 Wooden Stakes", 2),
 gear("Tsúral Buds (bunch)", 2, cat="provisions"), gear("Ngálu Wine (bottle)", 1, cat="provisions"),
 gear("Rations for the Underworld (1 person, 1 week)", 10, cat="provisions"), gear("Rations for Outdoors (1 person, 1 week)", 15, cat="provisions"),
 gear("Fresh Garments: Tunic, Kilt and Sandals", 30, cat="clothing"), gear("Warm Cloak", 15, cat="clothing"),
 gear("Quiver with 30 Quarrels", 20), gear("Quiver with 20 Arrows", 20), gear("Leaden Sling Pellets (20)", 1),
 gear("Chlén Beast to Pull a Cart", 100, cat="transport"), gear("Small Cart (one Chlén)", 75, cat="transport"), gear("Large Cart (two Chlén)", 150, cat="transport"),
 gear("Small Boat (12 ft)", 150, cat="transport"), gear("Small Merchant Ship", 15000, cat="transport"), gear("Large Merchant Ship", 30000, cat="transport"),
 gear("Small Warship", 20000, cat="transport"), gear("Medium Warship (bireme)", 40000, cat="transport"), gear("Large Warship (trireme)", 80000, cat="transport"),
 gear("Small Onager", 1000, cat="other", note="Not usable at short range; fires every other turn; 20-ft circle: within 10 ft of centre slain, others save 16+ or take 1d6."),
 gear("Medium Onager", 1500, cat="other", note="Siege engine; range about 1,450 ft, fires every other turn, 30-ft circle of damage."),
 gear("Trebuchet (wheeled)", 2000, cat="other", note="Range 1,200 ft, fires every third turn, 40-ft circle: within 15 ft slain, others save."),
 gear("Gem", 0, 1, cat="treasure", note="Weighs 1 Káitar."), gear("Item of Jewellery", 0, 350, cat="treasure"),
]
for i, d in enumerate(W + AR + G): d["sort"] = i
docs["equipment"] = W + AR + G


# ------------------------------------------------------------------ Swords & Glory gear (Vol. 2, Secs. 2.320-2.370)
SGSRC = "S&G Vol. 2 Sec. "
SGNOTE = "Swords & Glory price range in Káitars; the referee rolls (usually 1d10) for quality and the real price. The encumbrance cost uses the S&G scale (in hand or worn / hung or packed), not 1975 Káitar weights."
def low(rng):
    """Lowest price of a range, in Káitars (Hlásh = 1/20, Qírgal = 1/400)."""
    t = rng.replace(",", "")
    m = re.match(r"\s*([\d.]+)", t)
    v = float(m.group(1)) if m else 0
    if "Hlásh" in t: v /= 20
    elif "Qírgal" in t: v /= 400
    return round(v, 3)
def rangeText(rng):
    return rng if ("Hlásh" in rng or "Qírgal" in rng) else f"{rng} Káitars"
def sgbase(rng, enc, sec, note=""):
    return {"description": p(note, SGNOTE), "source": SGSRC + sec, "cost": low(rng), "weight": 0, "quantity": 1,
            "priceRange": rangeText(rng), "sgEncumbrance": enc}
CONV = "1975 rules values applied by weapon kind (Sec. 721): most weapons 1d6; daggers and light missiles 1d4; mace, flail, morning star, battleaxe, halberd, poleaxe and pike 1d6+1 with Strength over 80."
def sgweapon(name, rng, enc, die="d6", plus=0, cat="melee", minstr=0, edged=True, r=(0,0,0), extra=None, note=""):
    sysd = sgbase(rng, enc, "2.320", (note + " " if note else "") + CONV)
    sysd.update({"category": cat, "material": "chlen", "die": die, "damagePlus": plus, "magic": 0, "minStr": minstr, "twoHanded": False,
                 "noShield": False, "edged": edged, "extraBlow": False, "everyOtherRound": False,
                 "range": {"close": r[0], "medium": r[1], "long": r[2]}, "fixedDamage": "", "equipped": False})
    sysd.update(extra or {})
    return item("sg-gear", name, "weapon", "icons/svg/sword.svg", sysd)
NORANGE = "Swords & Glory gives no range for this weapon in 1975 terms; set range bands with the referee."
H = "Heavy weapon: 1d6+1, Strength over 80."
SGW = [
 sgweapon("Dagger or Knife (S&G)", "1-10", "0/.5", die="d4", r=(17,75,100)),
 sgweapon("Short Sword (S&G)", "3-12", "1/2"),
 sgweapon("One-handed Long Sword or Scimitar (S&G)", "5-14", "1/3"),
 sgweapon("One-handed Mace, Club, Morning Star, Warhammer or Flail (S&G)", "6-15", "1/4", plus=1, minstr=81, edged=False, note=H + " Club and warhammer are not named in the 1975 rules; they are treated like the mace on this row."),
 sgweapon("Longer One-handed Mace or Flail, or Heavy One-handed Axe (S&G)", "8-17", "2/5", plus=1, minstr=81, note=H),
 sgweapon("Two-handed Sword (S&G)", "11-20", "4/10", plus=2, minstr=90, extra={"twoHanded": True, "noShield": True}, note="Treated as the 1975 great two-handed sword: 1d6+2, Strength 90, no shield."),
 sgweapon("Two-handed Mace or Flail (S&G)", "11-20", "4/10", plus=1, minstr=81, edged=False, extra={"twoHanded": True, "noShield": True}, note=H + " Shares the two-handed sword's price row."),
 sgweapon("Halberd, Poleaxe or Other Polearm (S&G)", "13-22", "5/10", plus=1, minstr=81, note=H),
 sgweapon("Javelin or Dart (S&G)", "1-5", "1/3", cat="thrown", r=(17,75,100), note="Thrown about 100 ft, as the 1975 javelin."),
 sgweapon("Short Spear or Quarterstaff (S&G)", "2-11", "3/8"),
 sgweapon("Long Spear or Short Pike (S&G)", "3-12", "4/10", note="The 1975 rules give the spear 1d6 and the pike 1d6+1 (Strength over 80); 1d6 is set here. Raise it for a pike."),
 sgweapon("Long Pike (S&G)", "10-19", "6/—", plus=1, minstr=81, note=H + " Too long to sling on one's back."),
 sgweapon("Short Self-bow (S&G)", "3-12", "3/5", cat="missile", note=NORANGE),
 sgweapon("Short Composite Bow (S&G)", "35-44", "3/5", cat="missile", note=NORANGE),
 sgweapon("Longbow of Séresh Wood (S&G)", "10-19", "3/7", cat="missile", r=(100,450,600), note="Ranges of the 1975 longbow."),
 sgweapon("Long Composite Bow (S&G)", "40-130", "3/7", cat="missile", r=(100,450,700), note="Ranges of the 1975 composite bow."),
 sgweapon("Light Crossbow (S&G)", "60-150", "4/8", cat="missile", r=(100,400,550), note="Ranges of the 1975 light crossbow."),
 sgweapon("Medium Crossbow (S&G)", "80-170", "5/10", cat="missile", note="Not in the 1975 rules. " + NORANGE),
 sgweapon("Heavy Crossbow (S&G)", "100-190", "7/12", cat="missile", r=(100,500,750), extra={"everyOtherRound": True}, note="Ranges and rate of the 1975 heavy crossbow."),
 sgweapon("Leather Sling (S&G)", "1-5", "0/0", cat="missile", edged=False, r=(50,225,300), note="Ranges as the 1975 sling."),
 sgweapon("Staff-sling (S&G)", "3-12", "2/7", cat="missile", edged=False, r=(100,450,600), note="Ranges as the 1975 staff-sling."),
 sgweapon("Bolas (S&G)", "3-12", "1/3", cat="thrown", edged=False, r=(20,90,120)),
 sgweapon("Blowgun (S&G)", "4-13", "3/5", die="d4", cat="missile", edged=False, note="Rare in the Five Empires. Not in the 1975 rules; 1d4 as a light missile. " + NORANGE),
 sgweapon("Ballista (S&G)", "200-1,000", "—/200-400", cat="siege", r=(400,850,1200), extra={"fixedDamage": "5d6", "everyOtherRound": True}, note="1975 ballista: 5d6, fires every other round. Larger or smaller ballistae vary in price."),
]
def sggear(name, rng, enc, sec, cat="gear", note="", img="icons/svg/item-bag.svg"):
    sysd = sgbase(rng, enc, sec, note)
    sysd.update({"category": cat, "uses": {"value": 0, "max": 0}, "equipped": False})
    return item("sg-gear", name, "equipment", img, sysd)
def sgarmour(name, rng, enc, t, note=""):
    sysd = sgbase(rng, enc, "2.320", note)
    sysd.update({"armourType": t, "material": "chlen", "magic": 0, "equipped": False})
    return item("sg-gear", name, "armour", "icons/svg/shield.svg", sysd)
PIECE = "Swords & Glory armour is bought piece by piece. The 1975 armour classes count only leather, chainmail, plate and shields, so this piece does not change armour class on its own; agree the suit's armour class with the referee."
SGA = [
 sgarmour("Light Helmet (S&G)", "2-11", ".5/3", "helmet"),
 sgarmour("Medium Helmet (S&G)", "6-14", "1/4", "helmet"),
 sgarmour("Heavy Helmet (S&G)", "15-24", "2/7", "helmet"),
 sgarmour("Gorget Collar and Shoulder Defences (S&G)", "12-21", "3/7", "piece", PIECE),
 sgarmour("Breastplate (S&G)", "20-29", "3/9", "piece", PIECE),
 sgarmour("Backplate (S&G)", "13-22", "2/7", "piece", PIECE),
 sgarmour("Simple Pectoral Breastplate (S&G)", "2-11", "1/4", "piece", "Held on with straps. " + PIECE),
 sgarmour("Pair of Vambraces (S&G)", "8-17", "1/2", "piece", "Lower arms. " + PIECE),
 sgarmour("Pair of Greaves (S&G)", "10-19", "1/3", "piece", "Calves. " + PIECE),
 sgarmour("Mail Kilt (S&G)", "10-19", "1/2", "piece", "Abdomen and upper thighs. " + PIECE),
 sgarmour("Set of Tasses or Pteruges (S&G)", "15-24", "1/2", "piece", "Abdomen and upper thighs. " + PIECE),
 sgarmour("Plate-shod Boots or Sabatons (S&G)", "8-17", "1/3", "piece", PIECE),
 sgarmour("Shirt or Tunic of Chainmail, Scale Mail or Cuir Bouilli (S&G)", "20-65", "3/9", "chain", "Set as chainmail for the 1975 armour class; hardened leather (cuir bouilli) may be ruled leather instead."),
 sgarmour("Shirt or Tunic of Leather (S&G)", "10-55", "2/4", "leather"),
 sgarmour("Small Targe or Buckler (S&G)", "1-5", ".5/1", "shield"),
 sgarmour("Medium Shield (S&G)", "5-14", "2/5", "shield"),
 sgarmour("Large Shield (S&G)", "10-19", "3/8", "shield"),
 sgarmour("Pavise (S&G)", "15-24", "9/15", "shield"),
 sgarmour("Light Infantry Suit (S&G)", "32-104", "4.5/13", "piece", "Averaged suit: light helmet, breastplate pectoral, vambraces, leather tunic. For skirmishers, slingers, sappers, archers, artillerymen and some marines. " + PIECE),
 sgarmour("Medium Infantry Suit (S&G)", "69-122", "11/32", "piece", "Averaged suit: medium helmet, gorget collar, breastplate, backplate, vambraces, greaves. For many pike and spear units, most crossbowmen, some marines. " + PIECE),
 sgarmour("Heavy Infantry Suit (S&G)", "111-192", "15/42", "piece", "Averaged suit: heavy helmet, gorget collar, breastplate, backplate, vambraces, greaves, mail kilt, tasses, sabatons. For many pike and spear units and halberdiers. " + PIECE),
]
A20 = "2.320"; AG = "2.330"; CL = "2.340"; TR = "2.370"
SGG = [
 sggear("Incendiary Fire-pot (S&G)", "15-24", "2/5", A20, "other", "Fragile clay pot of naphtha and powdered limestone, about 2 kg, lit by a wick and thrown by hand or staff-sling. No damage is given in either rule set; the referee rules."),
 sggear("Quiver for 20 Arrows or Box for 30 Quarrels (S&G)", "5-50", "2/3", A20),
 sggear("20 Arrows (S&G)", "15-24", ".5/0", A20, note="Up to 10 can be carried in the hand at no cost; more cost .5; no extra cost in a quiver."),
 sggear("30 Crossbow Quarrels (S&G)", "20-29", ".5/0", A20, note="As for arrows."),
 sggear("20 Leaden Sling Pellets (S&G)", "2-11", ".5/1", A20, note="Up to 5 in the hand at no cost; more cost .5; 1 in a pouch."),
 sggear("20 Blowgun Darts (S&G)", "8-17", ".5/1", A20),
 sggear("Baldric, Belt or Tabard (S&G)", "1-10", "0/.5", A20, "clothing", "Includes the sword-clip (Sarélqe) used instead of a scabbard."),
 sggear("Cape or Mantle (S&G)", "10-55", "2/4", A20, "clothing", "The better military version of the traveller's cloak."),
 sggear("Onager (S&G)", "700-1,600", "—/500-1,400", A20, "other"),
 sggear("Trebuchet (S&G)", "1,000-2,800", "—/1,000-2,800", A20, "other"),
 sggear("Ballista Bolt (S&G)", "20-40", "6/10", A20),
 sggear("Stone Ammunition for Onager or Trebuchet (S&G)", "3 per kg", "2 per kg", A20, note="Round stone balls cut by the masons' clans."),
 # adventure gear
 sggear("15 m of Rope (S&G)", "1-5", "2/8", AG, note="Holds about 200 kg."),
 sggear("3 m Pole or Staff of Tíu Wood (S&G)", "1-2", "5/10", AG),
 sggear("Bronze or Chlén-hide Spike, 40 cm (S&G)", ".5-.9", ".2/.4", AG),
 sggear("Wooden Stake, 1 m (S&G)", ".1-.5", ".5/1", AG),
 sggear("Wooden Mallet or Handtool (S&G)", "1-2", ".5/1", AG, note="Wooden mallet; bronze or Chlén-hide saw, chisel or other handtool."),
 sggear("Torch (S&G)", ".6-1", ".3/1", AG, note="About 1 m long; burns about 2 hours."),
 sggear("Bronze Lantern (S&G)", "2-11", "1/3", AG, note="Glass cover; burns 2 hours per flask of oil."),
 sggear("Wax Candle or Small Clay Oil Lamp (S&G)", ".1-.5", ".1/.1", AG, note="Burns about 1 hour."),
 sggear("Flask of Lamp Oil (S&G)", ".6-1", ".3/.6", AG, note="About half a litre; slow-burning, not usable as a fire-pot."),
 sggear("Flint, Steel and Tinder (S&G)", "1-5", ".1/.2", AG),
 sggear("Compass (S&G)", "21-30", ".1/.2", AG, note="Pottery bowl of oil with a floating sliver of magnetised iron. Rare."),
 sggear("Astrolabe (S&G)", "50-90", ".2/.3", AG, note="For astronomers and astrologers."),
 sggear("Ephemerides (S&G)", "40-85", ".5/1", AG, note="Ten years of celestial positions; from the temples of Thúmis, Ksárul and their Cohorts."),
 sggear("Pen-box (S&G)", "1-5", ".5/1", AG, note="Up to 5 reed pens and a cake of ink."),
 sggear("Roll of Paper or Papyrus (S&G)", ".1-.5", ".1/.2", AG),
 sggear("Roll of Parchment or Vellum (S&G)", ".5-.9", ".1/.2", AG),
 sggear("Paint-box (S&G)", "1-10", ".3/.6", AG, note="Pigments, brush, water jar, gold or silver leaf."),
 sggear("Bunch of Tsúral Buds (S&G)", ".3-.7", "0/0", AG, "provisions", "An aphrodisiac; also repels certain dangerous creatures if 1-2 days fresh."),
 sggear("Leather Belt Pouch (S&G)", "1-5", ".2/0", AG, note="100-200 cc. Encumbrance shown is empty."),
 sggear("Small Sack (S&G)", "2-6", ".5/1", AG, note="10,000-20,000 cc. Encumbrance shown is empty."),
 sggear("Large Sack (S&G)", "4-8", "1/2", AG, note="20,000-30,000 cc. Encumbrance shown is empty."),
 sggear("Small Leather Backpack (S&G)", "10-55", "6/8", AG, note="About 30,000 cc: a week's rations and small gear. Encumbrance shown is empty."),
 sggear("Large Leather Backpack (S&G)", "20-65", "8/12", AG, note="About 60,000 cc."),
 sggear("Blanket (S&G)", "2-6", "2/3", AG),
 sggear("Bed-mat (S&G)", ".6-1", "2/3", AG),
 sggear("Personal Toilet Articles (S&G)", "1-2", ".3/.5", AG, note="Razor, Vé paste, Anái sticks, comb, scissors, small mirror."),
 sggear("Rations, 1 Person, 1 Week (S&G)", "1-2", "1/3", AG, "provisions", "Poor fare: hard bread, dried fruit, a bit of cheese."),
 sggear("Better Rations, 1 Person, 1 Week (S&G)", "3-7", "2/4", AG, "provisions", "Bread, dried meat, preserved fruits, nuts and tubers."),
 sggear("Small Leathern Water-bottle (S&G)", "1-2", "2/3", AG, note="2 litres. Encumbrance shown is full."),
 sggear("Large Leathern Water or Wineskin (S&G)", "3-7", "4/6", AG, note="4 litres. Encumbrance shown is full."),
 sggear("Pot and Skillet (S&G)", "2-6", "2/4", AG),
 sggear("Physician's Leather Bag (S&G)", "20-80", "4/7", AG, note="Bandages, salves, drugs and medicaments. Encumbrance shown is full."),
 sggear("Sorcerer's Leather Bag (S&G)", "50-140", "4/7", AG, note="Ritual paraphernalia; contents vary by temple. Encumbrance shown is full."),
 sggear("Stretcher or Litter (S&G)", "5-14", "10/15", AG, note="Needs two bearers when laden."),
 sggear("Wooden or Leathern Chest (S&G)", "11-20", "8/11", AG, note="Empty."),
 sggear("Wooden or Leathern Trunk (S&G)", "26-45", "18/30", AG, note="Empty."),
 # clothing
 sggear("Loincloth (S&G)", "1-2 Qírgal", "0/.1", CL, "clothing"),
 sggear("Straw or Wooden-soled Sandals (S&G)", "10-14 Qírgal", "0/.1", CL, "clothing"),
 sggear("Kilt of Firyá Cloth (S&G)", "3-7 Hlásh", "0/.1", CL, "clothing", "Lower or middle class. Medium quality; finer pieces cost 2-3 times as much."),
 sggear("Sleeveless Cloth Vest (S&G)", "7-11 Hlásh", "0/.1", CL, "clothing", "Lower or middle class."),
 sggear("Over-tunic of Firyá Cloth (S&G)", "10-19", ".1/.3", CL, "clothing", "Lower or middle class."),
 sggear("Leather Belt or Cross-straps (S&G)", "1-2", "0/.1", CL, "clothing"),
 sggear("Leather Sandals, Slippers or Shoes (S&G)", "1-5", "0/.2", CL, "clothing"),
 sggear("Broad Decorative Collar of Chlén-hide (S&G)", "2-11", "1/2", CL, "clothing", "Middle or upper class."),
 sggear("Calf-high Leather Boots (S&G)", "4-8", "1/2", CL, "clothing"),
 sggear("Heavy Cloak or Travelling Mantle (S&G)", "5-9", "3/5", CL, "clothing", "Of Hmélu or Hmá wool."),
 sggear("Strong High Leather Boots (S&G)", "7-16", "1/3", CL, "clothing", "For long-distance travel."),
 sggear("Headdress (S&G)", "5-24", "1/4", CL, "clothing", "For middle- and upper-class townsmen, priests and bureaucrats."),
 sggear("Kilt of Silky Gúdru Cloth (S&G)", "3-7", "0/.2", CL, "clothing", "Middle or upper class."),
 sggear("Decorated Over-tunic or Vest of Gúdru Cloth (S&G)", "10-19", ".1/.3", CL, "clothing", "Middle or upper class."),
 sggear("Finest Pleated Kilt of Gúdru Cloth (S&G)", "20-60", ".1/.3", CL, "clothing", "Upper class."),
 sggear("Aristocrat's Headdress or Ceremonial Helmet (S&G)", "40-130", "1/3", CL, "clothing"),
 sggear("Aristocrat's Ornate Chlén-hide Collar (S&G)", "100-500", "2/4", CL, "clothing", "Upcurving shoulder epaulets, inlay and semi-precious stones."),
 sggear("Aristocrat's Over-tunic, Robe or Tabard (S&G)", "200-1,200", "3/6", CL, "clothing", "Gems, gold and silver embroidery, brocade."),
 sggear("Mantle, Veil, Pelerine or Pelisse of Thésun Gauze (S&G)", "300-1,200", ".2/.5", CL, "clothing", "Sewn with small gems."),
 # jewellery (price of the gold alone)
 sggear("Gold Ring (S&G)", "5-10", "", CL, "treasure", "10-20 g of gold. Price is for the gold alone; goldsmith adds 20-60% (50-140% for the best), ready-made items another 50-100%."),
 sggear("Gold Bracelet, Narrow (S&G)", "10-15", "", CL, "treasure", "20-30 g of gold. Price is for the gold alone."),
 sggear("Gold Bracelet, Armlet or Anklet, Wide (S&G)", "25-125", "", CL, "treasure", "50-250 g of gold. Price is for the gold alone."),
 sggear("Gold Necklace (S&G)", "25-125", "", CL, "treasure", "50-250 g of gold. Price is for the gold alone."),
 sggear("Gold Tiara (S&G)", "37.5-150", "", CL, "treasure", "75-300 g of gold. Price is for the gold alone."),
 sggear("Gold Belt Plaque (S&G)", "25-50", "", CL, "treasure", "50-100 g of gold. Price is for the gold alone."),
 sggear("Gold Collar (S&G)", "50-500", "", CL, "treasure", "100-1,000 g of gold. Price is for the gold alone."),
 # transport
 sggear("Chlén Beast, Poor to Mediocre (S&G)", "51-100", "", TR, "transport", "Moves about 3 km an hour, works up to 5 hours a day."),
 sggear("Chlén Beast, Male, Prime (S&G)", "100-300", "", TR, "transport"),
 sggear("Chlén Beast, Female, Prime (S&G)", "150-350", "", TR, "transport"),
 sggear("Chlén Calf (S&G)", "26-45", "", TR, "transport"),
 sggear("Small Chlén Cart (S&G)", "81-100", "", TR, "transport", "One Chlén; carries 600-900 kg; 15-20 km a day."),
 sggear("Large Chlén Cart (S&G)", "131-150", "", TR, "transport", "Two Chlén; carries 1,800-2,700 kg; 15-20 km a day."),
 sggear("Small Litter (S&G)", "36-55", "", TR, "transport", "One passenger, 2 porters (not included)."),
 sggear("Larger Litter (S&G)", "101-200", "", TR, "transport", "1-2 passengers, 4 porters (not included)."),
 sggear("Large Inter-city Litter (S&G)", "201-300", "", TR, "transport", "1-2 passengers, 8 bearers plus 8 relief (not included)."),
 sggear("Very Large Inter-city or State Litter (S&G)", "401-500", "", TR, "transport", "2-4 passengers, 16+ bearers and as many relief (not included)."),
 sggear("Small Boat (S&G)", "51-150", "", TR, "transport", "3-5 m; 6 persons, or 4 with baggage."),
 sggear("Fishing Boat (S&G)", "500-800", "", TR, "transport", "9-13 m; 10-20 persons, or 6-15 with baggage."),
 sggear("Large Passenger Craft or Small River Barge (S&G)", "1,000-5,000", "", TR, "transport", "15-18 m; 50-70 persons or 4-6 tonnes of cargo."),
 sggear("Small Merchant Ship: the Hrú (S&G)", "7,000-11,000", "", TR, "transport"),
 sggear("Large Merchant Ship: the Tnék (S&G)", "14,000-23,000", "", TR, "transport"),
 sggear("Small Warship: the Séscha (S&G)", "12,000-21,000", "", TR, "transport"),
 sggear("Medium Warship: the Srügánta (S&G)", "23,000-42,000", "", TR, "transport"),
 sggear("Large Warship: the Qél (S&G)", "51,000-70,000", "", TR, "transport"),
 sggear("Very Large Warship: the Zírunel (S&G)", "101,000-200,000", "", TR, "transport"),
 sggear("Largest Warship (S&G)", "250,000-350,000", "", TR, "transport", "The Tsolyáni Mrishurén, the Livyáni Cháosaz, the Mu'ugalavyáni Nu'útla, etc."),
]
for i, d in enumerate(SGW + SGA + SGG): d["sort"] = i
docs["sg-gear"] = SGW + SGA + SGG

# ------------------------------------------------------------------ Creatures
C = [
 # name, type, NA, AC, Move, HD, T, L, TL, S, TS
 ("Ahoggyá","N","10-120",4,"9","3","F: 40","40: 20-240","G: 50","10-60","D: 30"),
 ("Akhó","W","1",2,"9","6/10/16","nil","50: 1-6","","",""),
 ("Aqáa","U","1",2,"9/12/15","6/12/18","nil","40: 1-3","F: 60","",""),
 ("Biridlú","U","2-8",3,"6/13","4+1","","20: 4-16","D: 40","",""),
 ("Chashkéri","W","1-12",7,"12","1","","15: 2-24","C: 20","",""),
 ("Chlén","A","1-20",2,"6","3","nil","30: 3-60","","",""),
 ("Chnélh","A","20-400",7,"12","1-1","nil","30: 40-800","A: 20","",""),
 ("Chólokh","F","1-20",3,"6/18","1+1","nil","50: 2-40","","",""),
 ("Dlákolel","F","1",2,"6/12","6","nil","20: 1-6","A: 40","",""),
 ("Dlaqó","U","2-12",2,"6","3/6/9","nil","20: 4-24","","",""),
 ("Dnélu","A","1-2",3,"15","4+1","nil","40: 2-7","B: 10","",""),
 ("Dzór","A","2-12",4,"15","6+3","C: 40","40: 4-24","D: 40, E: 10","",""),
 ("Feshénga","A","1-6",4,"12","5","nil","30: 2-12","","",""),
 ("Gerednyá","F","6-36",4,"3/18","3","nil","40: 12-72","","",""),
 ("Ghár","W","1",2,"4","8","nil","60: 1-6","","",""),
 ("Gíriku","F","2-12",4,"6/24","3","nil","20: 4-24","","",""),
 ("Haqél","W","1",3,"9","5/10/15","nil","90: 1-12","","",""),
 ("Hláka","N","10-60",5,"15/30","2","B: 40","30: 50-100","","",""),
 ("Hli'ír","U","1-4",2,"12","8","B: 30","30: 2-8","E: 70","",""),
 ("Hlutrgú","N","10-60",7,"12","2","C: 30","40: 100-600","D: 60","12-72","C: 50"),
 ("Hlýss","N","10-100",4,"9","2","H: 40","50: 100-600","H: 40","20-120","G: 30"),
 ("Hrá","U","1-12",4,"12","7","B: 80","20: 2-40","F: 60","",""),
 ("Hurú'u","U","3-30",7,"9","2+3","nil","30: 6-60","B: 90","",""),
 ("Hyahyú'u","A","6-24",4,"12","3+3","nil","20: 12-48","","",""),
 ("Káyi","F","1-6",7,"15","4","A: 40","20: 6-36","G: 50","",""),
 ("Khéshchal","F","1-20",8,"6/30","1-1","A: 10","10: 2-40","B: 20","",""),
 ("Kruá","W","1",2,"9/12/18","3/8/16","nil","50: 1-6","","",""),
 ("Kúrgha","U","6-120",6,"12","1","nil","10: 12-240","","",""),
 ("Kurukú","A","1-12",9,"15","1-1","nil","40: 10-100","A: 20","",""),
 ("Kýni","F","1-6",8,"6/30","1-3","nil","10: 1-12","","",""),
 ("Lrí","F","1-10",3,"6/24","4","nil","20: 2-20","","",""),
 ("Marashyálu","U","1-3",3,"12","4","nil","40: 2-6","C: 40","",""),
 ("Mnór","A","1-12",2,"9","3+1","nil","40: 2-24","C: 15","",""),
 ("Mrúr","U","3-36",6,"6","1+3","nil","20: 10-100","B: 30","",""),
 ("Mu'ágh","W","1-6",8,"2","3/6/15","nil","","","",""),
 ("Nenyélu","W","1-6",6,"15","2","nil","40: 6-36","","",""),
 ("Ngáyu","U","1-4",4,"12","4","nil","20: 4-8","","",""),
 ("Ngóro","U","1",6,"6","16","D: 20","50: 1-3","E: 80","",""),
 ("Ngrútha","W","1-20",3,"6","3","nil","20: 2-40","","",""),
 ("Nshé","U","1",2,"15","10","nil","","","",""),
 ("Páchi Léi","N","1-100",4,"12","1","A: 30","30: 60-360","H: 30","12-72","B: 30"),
 ("Pé Chói","N","2-12",2,"12","1+3","A: 20","70: 100-600","C: 40","4-24","B: 30"),
 ("Pygmy Folk","N","1-100",6,"6","1-1","A: 20","60: 10-1,000","C: 40","",""),
 ("Qáqtla","W","1-3",3,"12","5","nil","20: 2-12","","",""),
 ("Qól","U","4-40",2,"9","1+1","2 K","40: 10-100","D: 40","",""),
 ("Qumqúm","U","1",6,"12","9","A: 40","30: 2-6","F: 70","",""),
 ("Rényu","A","1-6",4,"12","2","1-6 K","20: 6-36","C: 20","",""),
 ("Ru'ún","U","1-6",2,"15","11","A: 80","20: 2-12","F: 80","",""),
 ("Sagún","U","1-3",3,"9","10","A: 50","30: 2-6","D: 70","",""),
 ("Sérudla","A","1-4",2,"15","5/8/12","G: 50","20: 2-12","H: 50","",""),
 ("Shánu'u","F","2-12",3,"15/24","3+1","nil","30: 4-24","","",""),
 ("Shédra","U","2-24",6,"9","2","B: 40","20: 4-48","C: 70","",""),
 ("Shén","N","10-120",2,"9","3","D: 30","80: 100-1,200","H: 70","2-200","D: 40"),
 ("Shunned Ones","U","2-200",2,"12","2","D: 30","40: 4-400","E: 50","",""),
 ("Sró","W","1-3",3,"9/12/20","5/9/13","A: 30","40: 1-6","E: 40","",""),
 ("Ssú","N","10-120",2,"12","2+3","A: 30","50: 20-240","H: 50","",""),
 ("Swamp Folk","N","2-200",5,"9","1+1","D: 20","20: 4-400","E: 40","4-80","D: 30"),
 ("Teqéqmu","F","1",4,"6/18","6/8/10","nil","10: 1-12","","",""),
 ("Thúnru'u","U","2-12",4,"12","5","nil","20: 4-24","D: 40","",""),
 ("Tinalíya","N","1-100",7,"9","1","D: 40","40: 100-600","E: 40","1-100","C: 30"),
 ("Tletlákha","W","2-24",5,"12","3+3","nil","40: 10-120","","",""),
 ("Tsi'íl","A","1-4",2,"9","6","nil","30: 4-8","","",""),
 ("Tsóggu","W","1-3",6,"9","3","nil","40: 2-6","D: 40","",""),
 ("Tsú'uru","U","1-6",3,"12","5+3","D: 10","30: 2-12","D: 90","",""),
 ("Vorodlá","F","1-12",5,"6/24","4","A: 20","25: 2-24","C: 30","",""),
 ("Vringálu","F","1-12",5,"6/24","4+1","nil","10: 4-48","","",""),
 ("Yéleth","U","1-4",6,"9","3","B: 30","30: 2-12","C: 40","",""),
 ("Zrné","A","4-24",5,"15","6","nil","40: 8-48","","",""),
]
TYPES_MIXED = {"Chnélh":"A/U","Káyi":"F/U","Mu'ágh":"W/U","Sró":"W/U"}
NONHUMAN_ATT = {"Ahoggyá":"Neutral","Hláka":"Neutral","Páchi Léi":"Neutral","Shén":"Neutral","Pé Chói":"Friendly","Pygmy Folk":"Friendly","Swamp Folk":"Friendly","Tinalíya":"Friendly","Hlutrgú":"Hostile","Hlýss":"Hostile","Shunned Ones":"Hostile","Ssú":"Hostile"}
def mid_hd(hd):
    parts = hd.split("/")
    first = parts[len(parts)//2]
    m = re.match(r"(\d+)\s*([+-]\s*\d+)?", first)
    d, pl = int(m.group(1)), int(m.group(2).replace(" ","")) if m.group(2) else 0
    return d, pl
# Token footprint on the 10-ft grid: stated length or width / 10 ft, rounded up, using the middle of a range.
# Height of upright beings does not count. Creatures with no stated dimensions stay 1x1.
TOKEN_SIZE = {"Dlákolel": 2, "Shánu'u": 3, "Chlén": 2, "Ghár": 2, "Ngóro": 3, "Tsi'íl": 2, "Dzór": 2}
# Creatures that come in sizes: squares per size, in the same order as their size table.
SIZE_SQUARES = {"Sérudla": [2, 3, 4], "Haqél": [2, 3, 5], "Kruá": [1, 2, 4], "Sró": [2, 3, 5], "Aqáa": [2, 4, 6],
                "Akhó": [1, 3, 5], "Dlaqó": [1, 2, 3], "Mu'ágh": [1, 1, 1], "Teqéqmu": [1, 2, 2]}
actors = []
sys_path_added = __import__("sys").path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from creature_text import C as CTEXT
for i, (n, t, na, ac, mv, hd, T, L, TL, S_, TS) in enumerate(C, 1):
    tx = CTEXT[n]
    fl = tx["flags"]
    d, pl = mid_hd(hd)
    avg = max(1, round(d * 3.5 + pl))
    sizes = ""
    size_note = ""
    if tx["sizes"]:
        labels, chances, hds = tx["sizes"]
        sq = SIZE_SQUARES.get(n, [1] * len(labels))
        sizes = "|".join(f"{l}:{c}:{h}:{q}" for l, c, h, q in zip(labels, chances, hds, sq))
        size_note = "Sizes: " + ", ".join(f"{l} {h} HD ({c}%)" for l, c, h in zip(labels, chances, hds)) + ". Each token placed rolls its size and hit points."
    note = "Armour class from the full entry; the summary table leaves it blank. " if n == "Ahoggyá" else ""
    special = ""
    if S_ or TS: special = f"Per ship: {S_ or '-'}; treasure aboard ship: {TS or '-'}."
    bio = "".join(f"<p>{x}</p>" for x in [tx["look"], tx["play"], size_note, note.strip()] if x)
    _id = did("creatures", n)
    actors.append({"_id": _id, "name": n, "type": "creature", "img": "icons/svg/mystery-man.svg",
        "system": {"creatureType": t, "hitDice": hd, "hp": {"value": avg, "max": avg}, "ac": ac, "acMagic": fl.get("acMagic", 0), "move": mv,
                   "numberAppearing": na, "attitude": NONHUMAN_ATT.get(n, ""), "intelligent": fl.get("intelligent", t == "N"),
                   "noMorale": fl.get("noMorale", False), "attackTable": "creature", "attacks": fl.get("attacks", 1),
                   "damageDice": fl.get("damageDice", ""), "hitBonus": fl.get("hitBonus", 0), "dmgBonus": fl.get("dmgBonus", 0), "saveAs": "warrior",
                   "sizes": sizes,
                   "treasure": {"carried": T, "lair": (f"Lair {L}" if L else "") + (f"; treasure {TL}" if TL else ""), "special": TYPES_MIXED.get(n, "")},
                   "special": special, "source": f"{EPT} Sec. {tx['sec']}; stats Sec. 1222 no. {i}",
                   "biography": bio, "notes": ""},
        "items": [], "effects": [], "folder": None, "sort": i, "ownership": {"default": 0}, "flags": {},
        "prototypeToken": {"name": n, "actorLink": False, "disposition": -1, "displayName": 30, "displayBars": 30, "bar1": {"attribute": "hp"},
                           "width": (SIZE_SQUARES[n][1] if n in SIZE_SQUARES else TOKEN_SIZE.get(n, 1)),
                           "height": (SIZE_SQUARES[n][1] if n in SIZE_SQUARES else TOKEN_SIZE.get(n, 1))},
        "_key": f"!actors!{_id}"})
docs["creatures"] = actors

# ------------------------------------------------------------------ Rules reference journal
import sys
sys.path.insert(0, ROOT)
def table(head, rows):
    h = "".join(f"<th>{x}</th>" for x in head)
    b = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table>"
TI = [[19,16,13,10,7],[18,15,12,9,6],[17,14,11,8,5],[16,13,10,7,4],[15,12,9,6,3],[14,11,8,5,2],[13,10,7,4,2],[12,9,6,3,2],[11,8,5,2,1]]
TII = [[18,17,16,15,14,13,12,11],[17,16,15,14,13,12,11,10],[16,15,14,13,12,11,10,9],[15,14,13,12,11,10,9,8],[14,13,12,11,10,9,8,7],[13,12,11,10,9,8,7,6],[12,11,10,9,8,7,6,5],[11,10,9,8,7,6,5,4],[10,9,8,7,6,5,4,3]]
DMG = [[1]*8,[1]*8,[1]*8,[2,1,1,1,1,1,1,1],[2,2,1,1,1,1,1,1],[3,2,2,1,1,1,1,1],[3,3,2,2,1,1,1,1],[4,3,3,2,2,1,1,1],[4,4,3,3,2,2,1,1],[5,4,4,3,3,2,2,1]]
ACD = ["Plate and steel shield","Plate and Chlén-hide shield","Plate","Chainmail and shield","Chainmail","Leather and shield","Leather","Shield only","No armour"]
pages = []
def page(name, html, sort):
    return {"name": name, "html": html, "sort": sort}
NOTICE = "<b>This work is a Fan Publication, an unofficial work not approved for Tékumel. Tékumel, the Empire of the Petal Throne, and all related products and materials are protected by national and international intellectual property law. For additional information, please visit www.tekumelfoundation.org</b>"
pages.append(page("How this system works", p(
 NOTICE,
 "This is an unofficial fan system for the 1975 Empire of the Petal Throne rules, with an optional Swords &amp; Glory background generator.",
 "<b>Attacks:</b> target a token and click a weapon. The system reads the defender's armour class and magical armour, finds the score needed on Table I (men) or Table II (creatures), adds the attacker's talent and weapon bonuses, and offers a damage button on a hit. A natural 20 doubles the damage dice and offers the instant-death roll.",
 "<b>Damage:</b> the number of dice comes from the damage dice table by attacker level against defender hit dice. Priests read one row up, Magic Users with a dagger two rows up; two- and three-dice beings start on rows II and III. Talent damage bonuses and weapon pluses are added once; missiles get no talent damage bonus.",
 "<b>Spells:</b> each casting rolls d100 against the spell-working chance (level plus psychic bonus) and uses one daily casting. Use <i>Dawn: regain spells</i> each game morning.",
 "<b>Experience:</b> <i>Award Experience</i> adds treasure and kills, applies the talent bonus and the reduced share at higher levels, and sets the level. <i>Level Up</i> rolls hit points, talent increase, original skill and bonus spell."), 0))
pages.append(page("Combat tables", "<h2>Table I: men attacking</h2>" + table(["AC","Description","1-3","4-6","7-9","10-12","13+"], [[i+1, ACD[i], *TI[i]] for i in range(9)]) +
 p("Missiles: close range read one column to the left, long range one to the right. Broadsword and dagger: two blows, +1 needed.") +
 "<h2>Table II: nonhumans, animals and others attacking</h2>" + table(["AC","1 or less","1+1","2-3","4-5","6-7","8-9","10-11","12+"], [[i+1, *TII[i]] for i in range(9)]) +
 "<h2>Damage dice</h2>" + table(["Level","1","1+1","2-3","4-5","6-7","8-9","10-11","12+"], [[i+1, *DMG[i]] for i in range(10)]) +
 p("Beyond level X the same progression continues. A 7-dice creature uses row VII."), 1))
pages.append(page("Saving throws, morale and divine aid", "<h2>Saving throws (d20, equal or higher)</h2>" + table(["Profession and level","Poison","Spells","Paralysis/Hypnosis","Eyes"],
 [["Warrior 1-3",12,16,13,15],["Priest/Magic User 1-4",13,15,14,14],["Warrior 4-6",10,14,12,13],["Priest/Magic User 5-7",11,12,13,12],["Warrior 7-9",8,11,10,11],["Priest/Magic User 8-10",9,9,11,10],["Warrior 10+",7,10,9,10],["Priest/Magic User 11+",8,7,10,7]]) +
 p("A successful save against poison, Eyes and similar attacks still takes half damage or 2d6, whichever is less.") +
 "<h2>Morale (2d6, equal or higher to stand)</h2>" + table(["% remaining","1","1+1","2-3","4-5","6-7","8-9","10-11","12+"], [[30,8,7,6,5,4,3,2,1],[25,9,8,7,6,5,4,3,2],[20,10,9,8,7,6,5,4,3],[10,11,10,9,8,7,6,5,4],[5,12,11,10,9,8,7,6,5]]) +
 "<h2>Divine intervention (d100; Priests +5, Magic Users +3, plus offerings)</h2>" + table(["Gods","2-3","4-5","6-7","8-9","10+"], [["Retribution","1-70","1-50","1-30","1-20","1-10"],["No effect","71-95","51-80","31-70","21-60","11-50"],["Intervention","96+","81+","71+","61+","51+"]]) +
 table(["Cohorts","2-3","4-5","6-7","8-9","10+"], [["Retribution","1-60","1-40","1-20","1-10","1-5"],["No effect","61-85","41-70","21-60","11-50","6-40"],["Intervention","86+","71+","61+","51+","41+"]]) +
 p("Once a week. Retribution: 1d6 per level. First-level characters cannot ask."), 2))
# Sec. 2100: the gods and cohorts, summarised from the 1975 text.
GODS_GOOD = [
 ("Hnálla", "Supreme Principle of Good, Lord Whose Name May Not Be Known, Master of Light and Foe of Evil", "Shown only as an abstract emblem: a double joined circle (the infinity sign) with stylised wings.", "Those attacked by evil; those who do exceptional deeds for good; the pious, industrious and austere.", "White robes, silver skullcap."),
 ("Karakán", "Lord of War, Master of Heroes, Ultimate Warrior on the Final Day", "A powerfully built young man with a hawk-like head, winged, with shield and sword. Emblem: a stylised branching lightning bolt.", "Warriors and those who do valorous deeds.", "Red robes, armour, golden helmet with a high scarlet crest."),
 ("Thúmis", "Lord of Wisdom, Knower of Arts, Hidden Seeker of Eternal Knowledge, Sage of the Gods", "A seated scholar with a golden halo, a book and the Bednálljan Staff of Power; eyes on the hem of his robe. Emblem: a square with the Tsolyáni letter \"th\" centred.", "The good and wise, seekers of knowledge, sages and scholars, those who delve into ancient learning and use it for good.", "Grey robes, simple black skullcap."),
 ("Avánthe", "Mistress of Heaven, Maiden of Beauty, Mother of Devotion, Wife to Hnálla", "Many forms by aspect of female life: maiden, Aridáni warrior, mother with child. Emblem: a circle with rays descending.", "Women in all circumstances, those who found families and continuity, those who fight chaos and act justly for good.", "Priestesses: sky-blue robes, gold circlet. Priests (men of family and lineage): sky-blue robes, blue-lacquered Chlén-hide helmet with gold ornaments."),
 ("Belkhánu", "Lord of the Excellent Dead, Master of the Paradises of Teretané, Opener of the Gates of Heaven", "A four-armed being with a round, featureless head, holding a gem, a staff, a bowl and a golden orb. Emblem: a golden \"V\" on stylised waves.", "Those contacting the dead, those close to Death, those who go underground to defeat the masters of chaos, those attacked by the undead.", "Yellow robes, tall yellow headdress with a coif masking the face.")]
COHORTS_GOOD = [
 ("Drá the Uncaring", "Hnálla", "Singer of the Hymns of the Gods", "An unkempt, unexceptional man of middle years in a ragged, dirty robe. Emblem: two circles joined by a line (the brevity of the universe).", "His devotees learn total indifference to life, death and every human motive; called upon, he may not care enough to help, and if he does, he helps carelessly.", "Particoloured white and tan robes, turban-like headdresses."),
 ("Chegárra", "Karakán", "the Hero-King, Swordsman of Glory, Victorious Lord", "A bearded, fully armoured hero of early middle age fighting evil. Emblem: a glittering silver axe.", "Warriors in battle, generals of the legions of good, those who defy the demons of darkness alone, those who rule justly and bravely.", "Red and white chequered robes over silver armour, bronze helmet. Priestesses only from Aridáni warriors, dressed alike."),
 ("Keténgku", "Thúmis", "the Many-Eyed, Knower of All, Master of Scrolls", "A seated scribe with a scroll and four faces looking every way. Emblem: a stylised eye.", "Learners of languages, readers of ancient books and scrolls, seekers of knowledge for good, healers: the deity of scribes and physicians.", "Grey and white robes, cerulean skullcap (priests and priestesses)."),
 ("Dilinála", "Avánthe", "Lovely Maiden of the Emerald Crown, Aid of Lovers, Solace to the Weary, Daughter of Hnálla", "A demure, pure, delicate maiden holding out her hands to comfort. Emblem: a hand, palm down.", "Goddess of Consolation: the sick, old and weary, lovers, and all who seek solace.", "Priestesses only: blue and white robes, small emerald tiara."),
 ("Qón", "Belkhánu", "Ancient One of Pleasures, Guardian of the Gates of Hell Against Those Who Would Come Forth", "A six-legged, canine-headed beast with fangs, carved clubs in its forepaws and Hnálla's double oval on its brow. Emblem: a stylised mace held upright.", "Those attacked by creatures of the Underworld and the undead minions of Sárku.", "Yellow and white robes, a Chlén-hide mask of the god's long jaw, a thin veil over the upper face.")]
GODS_EVIL = [
 ("Hrü'ü", "Supreme Principle of Evil, Master of Negation and Non-Being, Opponent of Good, Dispenser of Calamities", "A bulbous, featureless purple circle with eight slender spider-like arms holding silver swords and other weapons. Emblem: a purple circle with a scarlet slash from upper left to lower right.", "Those who fight for chaos, undo the social order, bring violence, hate and despair, the secretive and vicious; most of all those who cause an unlooked-for calamity.", "Purple robes concealing their sex, velvet masks."),
 ("Vimúhla", "Lord of Fire, Power of Destruction and Red Ruin, Maker of Thunders", "A cone-shaped being with stylised flames for limbs, in black clouds shot with red lightning. Emblem: a stylised flame.", "Those who fight heroically for evil, start conflagrations or revel in pillage.", "Flame-orange robes, armour, tall headdress shaped like a leaping flame."),
 ("Ksárul", "Ancient Lord of Secrets, Doomed Prince of the Blue Room, Master of Magic and Gramarye", "A slender young man with a smiling, emotionless moon face, in black velvet, with a staff topped by a sapphire beetle. Emblem: an azure beetle over a pale crescent moon.", "Seekers of the ancients' forbidden secrets, those who contact dark beings of other planes, those building magical power against good.", "Black robes, smiling silver mask, black velvet mortarboard-like headdress; priestesses wear black wooden masks."),
 ("Sárku", "Five-Headed Lord of Worms, Master of the Undead, Guide Into Darkness, Demon of Decay", "A mighty worm-form with five suckered heads and tentacles holding the trappings of the grave. Emblem: a wavy line with a red circle at one end (the Eternal Worm).", "Those who call on his undead legions, who scuttle through the Underworld's catacombs, who send the living into Death.", "Earth-brown robes, whitened armour, headdress of skulls; faces painted as skulls."),
 ("Dlamélish", "Green-Eyed Lady of Sins, Mistress of Demons, Obsidian Princess of the Damned", "Many forms like Avánthe's but distorted and perverted; sometimes a voluptuous woman with a crocodile-like head. Emblem: an emerald-green drop falling into a silver oval.", "The depraved, those in sorcerous orgies with demons of the night, those who tear down society, family, clan and the rituals of purity.", "Priestesses: revealing emerald robes, silver tiara, bells at wrists and ankles. Priests: a motley crew in variations of emerald and silver.")]
COHORTS_EVIL = [
 ("Wurú the Unnameable", "Hrü'ü", "He Who Appears Where Evil Dwells, the Many-Legged Serpent of Gloom", "A great serpent with many centipede legs, antennae and six staring eyes. Emblem: a stylised serpent's head, tongue out.", "Devotees beset by the forces of good: he sends serpent creatures to aid them, or darkness to blind their foes.", "Particoloured purple and mauve robes, black velvet hood."),
 ("Chiténg", "Vimúhla", "Lord of Red Spouting Flame, Drinker of Blood, Reaper of Cities", "A scaled warrior with a lizard head and opalescent eyes, wielding the two-handed sword \"Bloodsong\". Emblem: a stylised two-handed sword.", "Warriors fighting good, besiegers of cities, devastators of civilised lands; overseer of atrocities and torments. The Imperium employs his devotees as prison staff and slave-pen guards.", "Orange and purple robes, full armour, iron or steel helmet. Priestesses only from hardened Aridáni warriors, dressed alike."),
 ("Grugánu", "Ksárul", "Knower of Spells, Black Sword of Doom, Reader of the Incantations of Evil", "A hulking half-human figure hidden in black robes, with a small vicious buzzard's head.", "The deity of evil Magic Users: sometimes capriciously gives spells and magical items, or otherwise aids them against good.", "Black and purple robes, tall soft black felt headdress with his emblem in silver: an open hand, fingers spread."),
 ("Durritlámish", "Sárku", "Black Angel of the Putrescent Hand, He of the Rotted Face, Opener of Catacombs", "A rotted corpse on a throne of bones holding a smoking bowl. Emblem: that bowl, the Vessel of the Vision of the World, showing the life-skeins of every creature.", "Those who deal with the undead, who aid Underworld creatures against violators, who sacrifice victims to him in the Orgy of Inimitable Demise.", "Brown and purple robes, brown-lacquered armour, faces painted grey like corpses."),
 ("Hriháyal", "Dlamélish", "Dancing Maiden of Temptation, Whore of the Five Worlds, Mistress of the Thirty-Two Unspeakable Acts", "A voluptuous dancing girl holding out a curved dagger. Emblem: a tall oval crossed by a horizontal wavy line.", "Those given to sensual pleasure, greed and carefree hedonism; Goddess of the Mysteries, whose strange temples lie scattered through the Underworlds.", "Priestesses: diaphanous green and purple robes, silver anklets and bracelets, silver coiled-serpent headdress. Priests: green and purple robes, fantastic silver headdresses, an obscene staff of power.")]
def gods_table(rows):
    return table(["God", "Titles", "Depiction and emblem", "Aids", "Clergy wear"], [[f"<b>{n}</b>", t, d, a, w] for n, t, d, a, w in rows])
def cohorts_table(rows):
    return table(["Cohort", "Serves", "Titles", "Depiction and emblem", "Aids", "Clergy wear"], [[f"<b>{n}</b>", g, t, d, a, w] for n, g, t, d, a, w in rows])
pages.append(page("The gods and cohorts (Sec. 2100)", p(
 "Any character may serve one God or one Cohort; Priests have special access, but every profession can receive advice and help. A character serving a good deity is aligned with good, one serving an evil deity with evil. Choose the deity on the character sheet; it lists the deities of the character's alignment (all of them for a neutral nonhuman).",
 "<b>Joining or changing:</b> only at the beginning of an adventure. Go to the deity's temple, get a favourable reaction from its priests (Nonplayer Character Reaction Table, Sec. 1020), and pay an offering: the score of percentile dice multiplied by the score of a d10, \"the latter representing thousands of Káitars\" (as printed). The priests may also ask for a week or a month of study in the temple.",
 "<b>Names:</b> the five good Gods are the Tlomitlányal and the five evil Gods the Tlokiriqáluyal (\"-yal\" is the Tsolyáni plural). Each God has a Cohort; the ten Cohorts are the Hlimékluyal. The 1975 rules call the two sides good and evil; later Tékumel books call them Stability and Change.",
 "<b>Divine intervention</b> (Sec. 2110; tables on the <i>Saving throws, morale and divine aid</i> page): once a week at most, player characters only, never at Level I. Gods are harder to reach than Cohorts and should do proportionately more. Phrase requests clearly: the referee may exploit ambiguity (\"Get us out of here!\" may land the party in another city, continent or world).") +
 "<h2>The five good Gods (Tlomitlányal)</h2>" + gods_table(GODS_GOOD) +
 "<h2>Their Cohorts</h2>" + cohorts_table(COHORTS_GOOD) +
 "<h2>The five evil Gods (Tlokiriqáluyal)</h2>" + gods_table(GODS_EVIL) +
 "<h2>Their Cohorts</h2>" + cohorts_table(COHORTS_EVIL) +
 p("Summarised from EPT (1975) Sec. 2100. Spellings follow the system's deity list."), 2.5))
pages.append(page("Spells and experience", "<h2>Chance a spell does NOT work</h2>" + table(["Level","I","II","III","IV","V","VI","VII","VIII","IX+"], [["Fail %",60,50,40,30,20,15,10,5,0]]) +
 p("Somewhat psychic +5%, quite psychic +10%, highly psychic +15% to the chance of working.") +
 "<h2>Bonus spells on reaching a level (d100, score needed)</h2>" + table(["Result","2","3","4","5","6","7","8","9","10","up"], [["One Group I",80,70,60,50,40,30,20,10,5,0],["One Group II",90,80,70,60,50,40,30,20,10,5],["Group I and Group II","-",90,80,70,60,50,40,30,20,10],["One Group III","-","-",90,80,70,60,50,40,30,20],["Group II and Group III","-","-","-",90,80,70,60,50,40,30]]) +
 "<h2>Experience</h2>" + p("1 point per Káitar of treasure; 50 per hit die of a slain foe (pluses ignored; half, rounded up, if slain by an Eye). Points count in full at levels I-III, 50% at IV-V, 25% at VI-VII, 10% at VIII-IX, 5% at X+. Beyond IX, 10,000 counted points per level.") +
 table(["Level","Warrior / Priest","Magic User"], [["I","0","0"],["II","2,001","2,001"],["III","4,001","4,001"],["IV","8,001","8,001"],["V","16,001","16,001"],["VI","32,001","32,001"],["VII","64,001","64,001"],["VIII","120,001","110,001"],["IX","240,001","200,001"]]), 3))
pages.append(page("Table rulings in this system", p(
 "Where the 1975 text is silent or ambiguous, this system makes the following choices. Each one is labeled in the sheet or item and can be changed.",
 "<b>Talent checks:</b> the 1975 rules have no check against a single talent. Clicking a talent on the sheet rolls d100 and succeeds under the talent's score, the same method as the Sec. 725 Physical Action check; shift-click adds a modifier set by the referee.",
 "<b>Constitution 41-60 revival chance:</b> not stated; 50% (between the 40% and 60% bands) is used.",
 "<b>Failed spells:</b> the text does not say whether a failed roll uses up the day's casting. A world setting controls this (default: it does).",
 "<b>Creature saving throws:</b> the save table covers professions only. Creatures save as a Warrior of level equal to their hit dice by default.",
 "<b>Hit dice values such as 6/10/16:</b> small, medium and large specimens; the medium value is used for combat tables.",
 "<b>Hit dice beyond the table:</b> the row for (level - 10) is added to the top row, matching both worked examples in Sec. 710.",
 "<b>Cure Serious Wounds:</b> described among the priestly skills but missing from the order table; placed 9th following the descriptions.",
 "<b>Energy Bolt:</b> the effect of a failed save is not stated.",
 "<b>Sling and bolas damage, thrown and sling range bands:</b> not given separately; see each item.",
 "<b>Creature spellcasting:</b> EPT gives creature casters a level (e.g. Ssú: Magic User of level IV-XV) but no Psychic Ability; their spell chance uses the Caster level field (hit dice when 0) with average Psychic Ability.",
 "<b>Magic user arms and armour:</b> any dagger, steel or Chlén-hide; leather armour allowed (Sec. 721 over Sec. 920); a shield is flagged (AC 7 limit), helmets are not. Priests: slings and bolas count as non-edged; bows, crossbows and javelins are edged.",
 "<b>Species modifiers:</b> S&G Sec. 2.223 changes to Strength, Dexterity, Intelligence, Psychic Ability and Comeliness are added to nonhuman characters' EPT talents. Swamp Folk Psychic Ability is fixed at 1 (Non-Psychic). Ssú use the Grey Ssú values.",
 "<b>N'lüss modifiers:</b> S&G Sec. 2.222 attribute changes (Strength +10, Dexterity -10, Intelligence -10, Psychic Ability -5) are added to the EPT talent scores while a Human's homeland is N'lüss.",
 "<b>Weapon length groups:</b> weapons the S&G length list does not name were given a group by reading: EPT battleaxe, flail, morning star and mace 7; EPT spear 3; S&G one-handed mace row 8, longer mace or axe row 7; short spear or quarterstaff row 3 (5 for a quarterstaff). Change any weapon's group on its sheet.",
 "<b>Natural 20 with several damage dice:</b> the number of damage dice is doubled and bonuses added once, per Sec. 731.",
 "<b>Initiative:</b> a world setting chooses EPT reaction time (one d6 per side, sides by token disposition: Friendly = party, Hostile = foes, Neutral = others; ties roll again), Swords & Glory (d20 for every combatant, rerolled each round; optional weapon length order in round 1), or a d6 for each combatant.",
 "<b>Token sizes:</b> stated length or width / 10 ft, rounded up (middle of a range); height does not count; no stated size = 1x1. Sized creatures take the footprint of the size rolled. The Aqáa's 20-60 ft is spread over its three sizes. Table choices where the book gives no measurement: Akhó 1x1 / 2x2 / 3x3 and Dlaqó 1x1 / 2x2 / 3x3 by size; Teqéqmu 1x1 / 2x2 / 2x2 by size; Tsi'íl (\"huge\") 2x2; Dzór (10-12 ft tall giants) 2x2."), 4))
pages.append(page("About and credits", p(
 NOTICE,
 "Empire of the Petal Throne and Tékumel were created by M.A.R. Barker. Tékumel is the property of the Tékumel Foundation (tekumelfoundation.org). The 1975 rules are available from the Foundation.",
 "This system contains game mechanics and short summaries only. Use it alongside your own copy of the rules."), 5))
jid = did("journal", "Rules Reference")
jdoc = {"_id": jid, "name": "Petal Throne Rules Reference", "pages": [], "folder": None, "sort": 0, "ownership": {"default": 0}, "flags": {}, "_key": f"!journal!{jid}"}
for pg in pages:
    pid = did("journal", pg["name"])
    jdoc["pages"].append({"_id": pid, "name": pg["name"], "type": "text", "title": {"show": True, "level": 1},
                          "text": {"content": pg["html"], "format": 1}, "sort": int(pg["sort"] * 100000), "ownership": {"default": -1}, "flags": {},
                          "_key": f"!journal.pages!{jid}.{pid}"})
docs["rules"] = [jdoc]

# ------------------------------------------------------------------ weapon length groups (S&G Vol 2 Sec. 2.822)
# 1 pike, 2 long spear, 3 short thrusting spear, 4 polearm/halberd, 5 quarterstaff, 6 two-handed weapon,
# 7 long one-handed, 8 short one-handed, 9 knife/dagger, 10 all others; 0 = not a melee weapon (no group).
# Entries marked * are my reading where the book does not name the weapon in its length list.
LENGTH = {
 "Sword (Chlén-hide)": 7, "Sword (iron or steel)": 7, "Scimitar (Chlén-hide)": 7,
 "Dagger (Chlén-hide)": 9, "Dagger (iron or steel)": 9,
 "Battleaxe (Chlén-hide)": 7, "Battleaxe (iron or steel)": 7,            # *
 "Flail (Chlén-hide)": 7, "Flail (iron or steel)": 7,                    # *
 "Morning Star (Chlén-hide)": 7, "Morning Star (iron or steel)": 7,      # *
 "Mace (Chlén-hide)": 7,                                                 # *
 "Spear (Chlén-hide)": 3,                                                # * EPT spear read as a short thrusting spear
 "Pike, 10 ft (Chlén-hide)": 1, "Pike, 10 ft (iron or steel)": 1,
 "Halberd, 8 ft (Chlén-hide)": 4, "Halberd, 8 ft (iron or steel)": 4,
 "Poleaxe (Chlén-hide)": 4, "Poleaxe (iron or steel)": 4,
 "Two-handed Sword (Chlén-hide)": 6, "Two-handed Sword (iron or steel)": 6,
 "Dagger or Knife (S&G)": 9, "Short Sword (S&G)": 8, "One-handed Long Sword or Scimitar (S&G)": 7,
 "One-handed Mace, Club, Morning Star, Warhammer or Flail (S&G)": 8,     # *
 "Longer One-handed Mace or Flail, or Heavy One-handed Axe (S&G)": 7,    # *
 "Two-handed Sword (S&G)": 6, "Two-handed Mace or Flail (S&G)": 6,
 "Halberd, Poleaxe or Other Polearm (S&G)": 4,
 "Short Spear or Quarterstaff (S&G)": 3,                                  # spear 3; set 5 for a quarterstaff
 "Long Spear or Short Pike (S&G)": 2, "Long Pike (S&G)": 1,
}
for _pk in ("equipment", "sg-gear"):
    for _d in docs[_pk]:
        if _d["type"] == "weapon":
            _d["system"]["lengthGroup"] = LENGTH.get(_d["name"], 0)

# ------------------------------------------------------------------ folders inside the skills and spells packs
SKILL_FOLDERS = [("plebeian", "Group I: Plebeian", "a"), ("skilled", "Group II: Skilled", "a"), ("noble", "Group III: Noble", "a"),
                 ("warrior", "Warrior professional skills", "m"), ("priest", "Priest professional skills", "m"), ("magicUser", "Magic User professional skills", "m")]
SPELL_FOLDERS = [("prof-priest", "Priest professional spells", "m"), ("prof-magicUser", "Magic User professional spells", "m"),
                 ("bonus-1", "Bonus spells: Group I", "a"), ("bonus-2", "Bonus spells: Group II", "a"), ("bonus-3", "Bonus spells: Group III", "a")]
folders = {}
def make_folders(pack, spec):
    out, ids = [], {}
    for n, (key, name, sorting) in enumerate(spec):
        fid = did(pack, "folder", key)
        ids[key] = fid
        out.append({"_id": fid, "name": name, "type": "Item", "folder": None, "sorting": sorting, "sort": (n + 1) * 100000,
                    "color": None, "description": "", "flags": {}, "_key": f"!folders!{fid}"})
    folders[pack] = out
    return ids
fs = make_folders("skills", SKILL_FOLDERS)
for d in docs["skills"]:
    g = d["system"].get("group")
    if g in fs:
        d["folder"] = fs[g]
        if g in ("warrior", "priest", "magicUser"): d["sort"] = (d["system"].get("rank") or 0) * 1000
fs = make_folders("spells", SPELL_FOLDERS)
for d in docs["spells"]:
    s_ = d["system"]
    key = f"prof-{s_.get('profession')}" if s_.get("kind") == "professional" else f"bonus-{s_.get('group')}"
    if key in fs:
        d["folder"] = fs[key]
        if s_.get("kind") == "professional": d["sort"] = (s_.get("rank") or 0) * 1000

# ------------------------------------------------------------------ magic items, books and treasure (Secs. 1500-1920, 2200)
exec(open(os.path.join(ROOT, "tools", "treasure_data.py"), encoding="utf-8").read())

# ------------------------------------------------------------------ write
src = os.path.join(ROOT, "src", "packs"); out = os.path.join(ROOT, "data", "packs")
shutil.rmtree(src, ignore_errors=True); os.makedirs(out, exist_ok=True)
for name, lst in docs.items():
    d = os.path.join(src, name); os.makedirs(d, exist_ok=True)
    seen = set()
    for doc in lst:
        assert doc["_id"] not in seen, doc["name"]; seen.add(doc["_id"])
        slug = re.sub(r"[^A-Za-z0-9]+", "_", doc["name"]).strip("_")[:40]
        json.dump(doc, open(os.path.join(d, f"{slug}_{doc['_id']}.json"), "w"), ensure_ascii=False, indent=2)
    for f in folders.get(name, []):
        json.dump(f, open(os.path.join(d, f"folder_{re.sub(r'[^A-Za-z0-9]+', '_', f['name'])}_{f['_id']}.json"), "w"), ensure_ascii=False, indent=2)
    json.dump(lst, open(os.path.join(out, f"{name}.json"), "w"), ensure_ascii=False)
    fpath = os.path.join(out, f"{name}.folders.json")
    if name in folders: json.dump(folders[name], open(fpath, "w"), ensure_ascii=False)
    elif os.path.exists(fpath): os.remove(fpath)
    print(f"{name}: {len(lst)}")

# Stamp module/packs.mjs with a hash of the data, so worlds notice new compendium data.
h = hashlib.sha1()
for name in sorted(docs):
    h.update(open(os.path.join(out, f"{name}.json"), "rb").read())
stamp = h.hexdigest()[:10]
pm = os.path.join(ROOT, "module", "packs.mjs")
txt = open(pm).read()
txt = re.sub(r'export const DATA_VERSION = "[^"]*";', f'export const DATA_VERSION = "{stamp}";', txt)
open(pm, "w").write(txt)
print("DATA_VERSION", stamp)
