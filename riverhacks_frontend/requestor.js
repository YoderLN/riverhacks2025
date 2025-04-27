const getData = (data) => {
    console.log(data);
    //console.log(JSON.parse(d));
}
const getDataFailed = (f) => {
    console.log(this);
}

const url = "http://localhost:5173/test.json";
const req = new XMLHttpRequest();
req.responseType = 'json';
req.onload = () => { getData(req.response) };
req.onerror = () => { getData(req.response) };
req.open("GET", url);
req.send();