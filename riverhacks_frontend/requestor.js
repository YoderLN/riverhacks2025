const getData = (data) => {
    console.log(data);
}
const getDataFailed = (f) => {
    console.log(f);
}

const url = "http://localhost:5173/data.json";
const req = new XMLHttpRequest();
req.responseType = 'json';
req.onload = () => { getData(req.response) };
req.onerror = () => { getData(req.response) };
req.open("GET", url);
req.send();