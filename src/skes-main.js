import {DND5E} from '/systems/dnd5e/module/config.js';
import Actor5e from '/systems/dnd5e/module/actor/entity.js';
import ActorSheet5eVehicle from '/systems/dnd5e/module/actor/sheets/vehicle.js';
import {RegisterSettings} from "./settings.js";


// Adds all the new skills.
//DND5E.skills['lcp'] = 'Schlossknacken';

Hooks.once('init', async function () {
    console.log("Skill Extensions Setting Up")
    RegisterSettings();
    loadTemplates([`modules/skill-extensions/templates/settings.hbs`]);
})


Hooks.on('init', async function () {
    var customskills = JSON.parse(game.settings.get('skill-extensions', 'skill-list')).Skills;
    if (DND5E.skills.length == (18 + customskills.length)) return;
    for (let i = 0; i < customskills.length; i++) {
        DND5E.skills[customskills[i].Shortname] = customskills[i].Skillname;
    }

    console.debug('This code runs once the Foundry VTT software begins' +
        ' it\'s initialization workflow.');
    $('body').addClass('skill-extensions');
    libWrapper.register('skill-extensions', 'CONFIG.Actor.documentClass.prototype.prepareData',
        function (wrapped) {
            console.debug('Adding new skills');
            const skills = this.data._source.data.skills;
            const type = this.data.type;
            if (type != 'vehicle') {
                for (let i = 0; i < customskills.length; i++) {
                    if (skills[customskills[i].Shortname] == undefined) {
                        skills[customskills[i].Shortname] = {
                            value: 0,
                            ability: customskills[i].Stat,
                            bonuses: {
                                check: "", passive: ""
                            }
                        }
                    }
                }
            }
            return wrapped(this);
        }
        , 'WRAPPER');
    libWrapper.register('skill-extensions', 'CONFIG.Item.documentClass.prototype.abilityMod',
        function (wrapped) {
            let result = wrapped();
            const itemData = this.data.data;
            const wt = itemData.weaponType;
            if (['simpleB', 'martialB'].includes(wt)) {
                if (itemData.ability) {
                    return itemData.ability;
                }
                return 'dex';
            }
            return result;
        }, 'MIXED');
})

Hooks.on('ready', function () {
    console.debug('This code runs once core initialization is ready and' +
        ' game data is available.');
    if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        ui.notifications.error('Module SKES(Skill Extensions) requires' +
            ' the "libWrapper" module. Please install and activate it.');
    }

});