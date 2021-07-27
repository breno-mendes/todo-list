exports.getDate = () => {

    const today = new Date();
    const region = "pt-BR";

    let options = {
        weekday: 'long',
        day: "numeric",
        month: "long"
    }

    return today.toLocaleDateString(region, options);

}

exports.getDay = () => {

    const today = new Date();
    const region = "pt-BR";

    let options = {
        weekday: 'long',
    }

    return today.toLocaleDateString(region, options);

}