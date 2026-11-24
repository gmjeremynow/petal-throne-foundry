# Changelog

## 0.7.7
- Background art: the system now ships a background image (assets/background.webp). Foundry shows it on the system's card in Game Systems, offers it as the background for new worlds, and uses it for worlds that have no background of their own.

## 0.7.6
- Token names follow the actor: renaming a character (or any actor whose token used its name) now renames its prototype token, so tokens dropped on a scene afterwards carry the new name. Linked tokens already placed on scenes under the old name are renamed too. A token given a different name on purpose is left alone.
- One-time fix on first load: player-owned characters renamed earlier get their token names brought up to date.

## 0.7.5
- Basic Talents: the column headers (Score, Rating, Hit, Dmg) are now dark text on a light band, readable in both themes.
- Talent checks: click a talent's name to roll d100 against it (success under the score, after species or nation modifiers); shift-click to add a modifier first. The 1975 rules have no single-talent check, so this follows the Sec. 725 Physical Action method and is listed under Table rulings in the Rules Reference.

## 0.7.4
- Swords & Glory background locks once rolled: the button is hidden from players and the background fields (sex, Aridáni, homeland through build) become read-only for them. The button is disabled for the GM too until the GM clicks Unlock background; the GM also has a Lock background button on the Background tab (use Lock for characters rolled before this version).

## 0.7.3
- Rules Reference: new page "The gods and cohorts (Sec. 2100)": serving a deity, joining or changing temples, the names of the good and evil Gods and Cohorts, and a table for each of the twenty with titles, depiction and emblem, whom they aid, and clergy dress. Placed after the divine intervention page.

## 0.7.2
- Akhó: the medium size now places a 3x3 token (was 2x2) and the extra-large size a 5x5 token (was 3x3).

## 0.7.1
- Fix: enabling several add-on modules at once could fail with "You may not create documents in the locked compendium". Unlocking a compendium rewrites one shared world setting, so packs being filled at the same time could re-lock each other. Compendium fills from the system and add-on modules now run one at a time (shared queue `globalThis.__petalThronePackLock`), and each unlock is checked and retried.

## 0.7.0
- New compendium Magic Items and Books: the 24 miscellaneous magical items (EPT Sec. 1500) and the 24 books (Sec. 1700), with charges where they have them.
- Treasure roller: `game.petalThrone.treasureDialog()` and the Roll Treasure macro (new Macros compendium) roll treasure hoards A-I (Sec. 2220) with coins, valued gems and jewelry (Sec. 2210), Eyes with charges and the 5% defective chance, magical arms and armour with sword, scimitar and battle-axe powers and spells (Secs. 1810-1820), scrolls with language, type, spells and curses (Sec. 1610), amulets, items and books. It also rolls a nonplayer character's magic by level and profession (Secs. 1910-1920) and single items. Results are whispered to the GM with draggable links.
- Creature sheets: GM buttons to roll carried or lair treasure from the creature's treasure text.
- New compendium Treasure Tables: 20 RollTables for the same tables (gems, jewelry, arms, scroll languages and types, the cursed scroll, sword powers, which Eye, amulet, item or book).
- Rules Reference: new pages for treasure, magical arms and armour, nonplayer characters' magic, and scrolls and books; treasure rulings added to the Table rulings page.

## 0.6.2
- Add-on hook `CONFIG.PT.levelTitleOverride(system)` so a module can give level titles by homeland or other details.

## 0.6.1
- More add-on hooks for professions: a custom XP bonus rule (`xpBonus`), limits that can look at the character's other items (`restriction(item, items)`), and a level-up bonus spell adjustment (`bonusAdjust`). New bonus results "two Group I" and "two Group II" spells for adjusted rolls.

## 0.6.0
- Add-on support: `game.petalThrone.registerProfession(key, def)` lets a module add a profession (XP table, titles, hit dice, XP prime talent, damage row, saves, divine bonus, arms limits); anything left out follows a named profession. Add-on skills and spells get their own folders when sorted. `CONFIG.PT.talentRollBonus` lets a module add a bonus to talent rolls.
- Creatures can have a fixed number of hit points (hit dice written as "1 hp").
- Level titles fall back to the profession name and level when a profession has none.

## 0.5.6
- Profession limits (EPT Sec. 721) are flagged, not blocked: magic users with a weapon other than a dagger or armour heavier than leather (mail, plate, shield, armour pieces), and priests with edged weapons. A warning icon shows on the item, equipping it gives a notice, and attack cards carry the warning.

## 0.5.5
- Skills and spells in the Items tab are sorted into type folders automatically: when the world loads, and whenever skills or spells are imported, created or have their group or kind changed. Skills by skill group (Group I-III, each profession's professional skills, languages, other); spells by kind (priest and magic-user professional spells, bonus spells by group). Professional ones are in list order.
- The Sort Skills & Spells button reports an error instead of failing silently.

## 0.5.4
- The Skills and Spells compendiums have folders by type: Group I, II and III skills, each profession's professional skills, priest and magic-user professional spells, and bonus spells by group. Professional skills and spells are in list order.
- New GM button in the Items tab, Sort Skills & Spells, puts skills and spells already imported into the same folders.

## 0.5.3
- Load and movement (EPT Sec. 920): the Gear tab totals gear and coins in Káitars and gives the foot movement (light 12", heavy 9", armoured 6"); the Main tab shows the movement. Limits scale with a nonhuman's hit dice (two-dice double, three-dice triple). Over 26,000 is flagged, since EPT gives no rate beyond it.
- New Gear tab checkbox: coins are carried (on by default; each coin weighs 1).

## 0.5.2
- Skill and spell slot counters on the Skills and Spells tabs: original skills left by group (Sec. 420), professional skills/spells left (Sec. 430: starting number plus one per level), and bonus spells left by group (Sec. 500). They count down as items are added and turn red when over.
- Roll New Character records the slots from its rolls; Level Up adds the original skill and bonus spell slots it rolls. An Adjust button sets the numbers by hand for existing characters.

## 0.5.1
- Species talent modifiers from S&G Vol 2 Sec. 2.223 apply to nonhuman characters the same way as the N'lüss modifiers (rolled score + modifier = total). Swamp Folk Psychic Ability is fixed in EPT's Non-Psychic band. A note under the talents lists each species' S&G traits.
- Ssú use the Grey Ssú modifiers; the note gives the Black Ssú values.

## 0.5.0
- New world setting, Player character species: Humans only; Humans and the S&G player species (default); or all EPT species including those hostile to Man. A character keeps its current species if the setting changes.
- N'lüss modifiers (S&G Vol 2 Sec. 2.222): while a Human's homeland is N'lüss (rolled by the background generator or typed in), Strength +10, Dexterity -10, Intelligence -10 and Psychic Ability -5 apply. The sheet shows the rolled score, the modifier and the total; bands, bonuses, spell chance and XP use the total. Changing the homeland removes them.

## 0.4.1
- Fixed: the Weapon length menu could show "None" for a weapon that has a length (the stored number was not matched to the menu choice).
- Weapons copied into the world before 0.4.0 (Items tab, characters, creatures, unlinked tokens) get their length from the compendium weapon of the same name, once, on first load.

## 0.4.0
- Initiative world setting: EPT reaction time (one d6 per side by token disposition, ties roll again; default), Swords & Glory (d20 for every combatant, rerolled at the start of each round), or a d6 for each combatant.
- S&G option (on by default): in round 1 the longer melee weapon strikes first (S&G Vol 2 Sec. 2.822), then the d20.
- Weapons have a Weapon length (S&G) field; compendium weapons are filled in. Groups for weapons the S&G list does not name are marked as readings in the README and the Table rulings page.
- Table rulings page: creature spellcasting ruling added.

## 0.3.5
- Dropping an item onto a sheet now always reports the result: added, read-only compendium copy, no permission, or an error (logged to the console).
- Items can also be dropped onto a token on the map to give them to that token's actor.

## 0.3.4
- Spells can be dropped onto creature sheets. They show as cast buttons on the Main tab (with uses left) and in a Spells list on the renamed "Weapons, Spells and Devices" tab.
- New creature field: Caster level (0 = use hit dice). Spell chance uses that level with average Psychic Ability, since EPT gives creature casters a level but no Psychic Ability score (table ruling).

## 0.3.3
- Drag and drop items onto creature and character sheets from a compendium or the Items tab (the sheet outlines while dragging; a notice confirms the item was added).
- Weapons on a creature appear as attack buttons on its Main tab, next to Natural Attack. They roll with the creature's own hit chance plus the weapon's magic bonus and damage.
- The GM can add, edit and remove a creature's weapons and devices without unlocking its stat block.

## 0.3.2
- Finish Character button: once pressed (after a confirmation), Roll New Character and the S&G background generator are removed from the sheet and refuse to run from macros. Only the GM can reopen them.

## 0.3.1
- Fixed: placing a creature did not roll its size or hit points, rename it, or post the GM card. The synchronous dice roll was refused by Foundry V12+ and stopped the whole step. Dice are now rolled directly, and the GM card lists each die.

## 0.3.0
- Token sizes (table choices where the book gives no measurement): Dlaqó 1x1/2x2/3x3 and Teqéqmu 1x1/2x2/2x2 by size; Tsi'íl and Dzór 2x2.

## 0.2.9
- Akhó token footprint by size: small 1x1, medium 2x2, extra-large 3x3.

## 0.2.8
- Placing a creature whispers the GM its size roll (for creatures that come in sizes) and its hit point roll.

## 0.2.7
- Full Tékumel Foundation fan publication notice in the README, license, system description and Rules Reference journal.

## 0.2.6
- Compendium data is versioned: when an update brings new data, the GM is offered a rebuild on load (an old packs/ database left in the system folder no longer hides new data). After any rebuild, monster art is reapplied and world creature token sizes are synced.

## 0.2.5
- World copies of creatures and their placed tokens now take token sizes from the compendium: automatically once after each update, after a compendium refill, and when the GM presses Apply Monster Art.

## 0.2.4
- Token sizes reviewed against every stated creature dimension: length or width / 10 ft, rounded up. Dzór, Akhó and Tsi'íl now 1x1; Shánu'u 3x3.
- Creatures that come in sizes get the token footprint of the size rolled when placed.

## 0.2.3
- Apply Monster Art is now only in the Actors tab (removed from System Settings), matching 1e FRPG.

## 0.2.2
- Apply Monster Art button in the Actors tab (GM only), as well as in System Settings.

## 0.2.1
- Monster art: "Token <name>" images in the monster art folder become creature portraits and tokens (Apply Monster Art in System Settings; reapplied when compendiums are refilled; unmatched files whispered to the GM).
- Token sizes set for large creatures (2x2 or 3x3 on the 10-ft grid).

## 0.2.0
- All 68 creature descriptions rewritten in plain words from the full entries (Secs. 1126-1129, 1221), including appearance, behaviour and special attacks.
- Creature stats checked against Sec. 1222 and the full entries; morale, attacks per round, damage and to-hit adjustments set from the entries.
- Placed creature tokens roll their own hit points (Sec. 710); creatures that come in sizes roll their size first (world setting).

## 0.1.9
- Item sheets open locked: fields show as plain text. Edit unlocks name, details and description; Lock relocks. Items you create on a character open unlocked.

## 0.1.8
- New Swords & Glory Gear compendium (139 items): weapons, piecemeal armour and averaged suits, ammunition, adventure gear, clothing, jewellery, Chlén beasts, carts, litters and ships, with S&G price ranges and encumbrance costs.
- 1975 iron and steel weapons added (weights from Sec. 920; no listed price).
- Fix: Hlásh are silver and Qírgal copper (20 Qírgal = 1 Hlásh, 20 Hlásh = 1 Káitar).
- Armour type "piece" for armour that does not change the 1975 armour class.

## 0.1.7
- New actors and the compendium creatures default their tokens to show name and hit point bar when hovered by anyone.

## 0.1.6
- Spell and Eye chat cards include the item description.

## 0.1.5
- Attacks no longer ask for armour class: the chat card states the best armour class hit (per range band for missiles), plus hit or miss against a targeted token.
- Creature stats are a locked stat block; the GM unlocks editing with the lock button. Current hit points stay editable.
- Descriptions, biography and notes show as formatted text with Edit and Done buttons.
- Source shown in italics on creature stat blocks.

## 0.1.4
- Source line in item summaries is italic, not bold.

## 0.1.3
- Fix: summary values were near-white under the dark theme; labels lost their text shadow. Name field is flat again.

## 0.1.2
- Item sheets redesigned: Summary tab (tags, key stats, formatted description with an Edit button) and Details tab (two-column fields).
- Names no longer oversized; checkboxes are light instead of dark squares.

## 0.1.1
- Fix: dropdowns and number boxes were dark-on-dark under the core dark theme; values now show on parchment.

## 0.1.0
- First playtest build: 1975 rules core, character and creature sheets, combat, spells, Eyes,
  experience and level-up, divine intervention, revival, morale.
- Optional Swords & Glory background generator.
- Compendiums: rules reference, skills, spells, Eyes, amulets, equipment, creatures.
