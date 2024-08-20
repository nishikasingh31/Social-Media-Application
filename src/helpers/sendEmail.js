const axios = require('axios')


exports.formateDate = (date) => {
    if (!date) return null;

    const res = date.split('-').reverse().join('-');
    return res;
}


exports.makeRequest = async (api_url, data) => {
    const full_api_url = api_url + '?' + new URLSearchParams(data)

    // const api_call = await axios.get(full_api_url)
    const api_call = await fetch(full_api_url, { method: 'GET' })
    const res = await api_call.json();

    return res;
}