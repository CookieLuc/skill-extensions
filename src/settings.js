const debounceReload = foundry.utils.debounce(window.location.reload.bind(window.location), 100);
Handlebars.registerHelper('toJSON', function (obj) {
    return JSON.stringify(this);
});

class SkesSettings extends FormApplication {
    constructor(object, options) {
        super(object, options)
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: 'Custom Skill extensions for DnD5E',
            id: 'skes-settings',
            template: `modules/skill-extensions/templates/settings.hbs`,
            width: '600	',
            height: 'auto',
            closeOnSubmit: true,
            resizeable: true,
        });
    }

    getData(options = {}) {
        const data = {
            isGM: game.user.isGM,
            settings: {
                "skill-list": {
                    name: 'Skill list',
                    hint: 'This changes the skill list to add custom skills',
                    id: "skill-list",     // "world" = sync to db, "client" = local storage
                    value: JSON.parse(game.settings.get('skill-extensions', 'skill-list')),
                }
            }, input: {
                Skillname: "",
                Skillshort: "",
                Skillstat: ""
            }
        }
        return data;
    }

    /**
     *
     * @param {*} event
     * @param {*} formData
     */
    async _updateObject(event, formData) {
        for (let [key, value] of Object.entries(formData)) {
            if (key === "Remove" && value !== false && value.length !== 0) {
                console.log("Skes | Deleting Skill")
                let oldSkills = JSON.parse(game.settings.get('skill-extensions', 'skill-list'))
                for (let i = value.length; i > 0; i--) {
                    for (let y = 0; y < oldSkills.Skills.length; y++) {
                        if (value[i - 1] === oldSkills.Skills[y].Shortname) {
                            oldSkills.Skills.splice(y, 1)
                            console.log("Skes | Skill successfully deleted")
                            break;
                        }
                    }
                }
                game.settings.set('skill-extensions', 'skill-list', JSON.stringify(oldSkills))
            } else if ((key !== "Skillname") && (key !== "Shortname") && (key !== "Stat") && (key !== "Add") && (key !== "Remove")) {
                await game.settings.set('skill-extensions', key, value);
            }
        }
        if (formData.Add === true && !((formData.Skillname === "") || (formData.Shortname === ""))) {
            console.log("Skes | Adding Skill")
            let obj = {Skillname: formData.Skillname, Shortname: formData.Shortname, Stat: formData.Stat}
            let oldSkills = JSON.parse(game.settings.get('skill-extensions', 'skill-list'))
            oldSkills.Skills.push(obj);
            game.settings.set('skill-extensions', 'skill-list', JSON.stringify(oldSkills))
            console.log("Skes | Skill successfully added")
        } else if (formData.Add === true) {
            console.log("Skes | Skill could not be added. Maybe the Input was incomplete?")
        }

        this.render();
    }

    /**
     *
     * @param {*} html
     */
    activateListeners(html) {
        super.activateListeners(html);
    }


}

export const RegisterSettings = async function () {
    game.settings.registerMenu('skill-extensions', "menu", {
        name: "",
        label: game.i18n.localize('skes.settings.menu.open_config'),
        icon: "fas fa-cog",
        type: SkesSettings,
        restricted: !0
    });

    game.settings.register('skill-extensions', 'skill-list', {
        name: 'Skill list',
        hint: 'This changes the skill list to add custom skills',
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: false,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String,
        default: '{ "Skills" : [{"Skillname": "template","Shortname": "tmp","Stat": "str"}]}',
        onChange: debounceReload,
        filePicker: false,  // set true with a String `type` to use a file picker input
    });
}