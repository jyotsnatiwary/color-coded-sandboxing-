var defaults = {
    saturation: 61,
    lightness: 73,
    accentcolor: "#fff",
    textcolor: "#000",
    toolbar_text: "#000",
    toolbar_field: "#fff",
    toolbar_field_text: "#000",
    //toolbar_top_separator: "#000",
    //toolbar_bottom_separator: "#000",
    //toolbar_vertical_separator: "#000"
};

async function setOption(setting, value) {
    browser.storage.local.set({
        ["options." + setting]: value
    });
}

async function resetOptions(e){

    e.preventDefault();
    let form = document.querySelector("form");

    let settings = Object.keys(defaults);

    for (var setting of settings) {
        await setOption(setting, defaults[setting]);
    }
    await populateOptions();
}

async function saveOptions(e) {
    e.preventDefault();
    let form = document.querySelector("form");
    let settings = Object.keys(defaults);
    for (var setting of settings) {
        await setOption(setting, form[setting].value);
    }
}

async function getOption(setting) {
    try {
        const found = await browser.storage.local.get("options." + setting);
        if (found.hasOwnProperty("options." + setting)) {
            return found["options." + setting];
        } else {
            return defaults[setting];
        }
    } catch (err) {
        return defaults[setting];
    }
}

async function populateOptions() {
    try{
        document.querySelector("#saturation").value =  await getOption("saturation");
        document.querySelector("#lightness").value =  await getOption("lightness");

        document.querySelector("#accentcolor").value =  await getOption("accentcolor");
        document.querySelector("#textcolor").value =  await getOption("textcolor");
        document.querySelector("#toolbar_text").value =  await getOption("toolbar_text");
        document.querySelector("#toolbar_field").value =  await getOption("toolbar_field");
        document.querySelector("#toolbar_field_text").value =  await getOption("toolbar_field_text");
        //document.querySelector("#lightness").value =  await getOption("lightness");
    }
    catch(e){}
}

document.addEventListener("DOMContentLoaded", populateOptions);
try{
    document.querySelector("form").addEventListener("submit", saveOptions);
    document.querySelector("form").addEventListener("reset", resetOptions);
}
catch(e){}
