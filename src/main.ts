import Timer = NodeJS.Timer;

console.log('hi');

const form: HTMLFormElement = document.querySelector('form');
const input: HTMLInputElement = document.querySelector('input');
const preSearchResult: HTMLPreElement = document.querySelector('#search-result');
const preLocation: HTMLPreElement = document.querySelector('#location');

interface SearchResultItem {
    title: string;
    woeid: string;
}

interface LocationItem {
    weather_state_name: string;
    weather_state_abbr: string;
}

interface LocationResults extends SearchResultItem   {
    consolidated_weather: LocationItem[];
}

let refreshInterval: number | null = null;

type SearchResultData = Array<SearchResultItem>;
const renderItem = (item: SearchResultItem) => {
    return `<button data-woeid="${item.woeid}">${item.title}</button><br />`;
};
const renderSearchResults = (data: SearchResultData) => {
    preSearchResult.innerHTML = data.reduce((acc, value) => {
        return acc + renderItem(value);
    }, '');
};

const renderLocationResults = (data: LocationResults) => {
    let locationData = data.consolidated_weather.reduce((acc, value) => {
        let rendered = renderLocationItem(value);
        return `${acc}<br><hr/>${rendered}`;
    }, '');
    preLocation.innerHTML = `Location: ${data.title}<br>${locationData}`;
};
const renderLocationItem = (item: LocationItem) => {
    return `
Weather state: ${item.weather_state_name}
<img src="https://www.metaweather.com/static/img/weather/${item.weather_state_abbr}.svg" height="20px">`;
};

const loadLocationResults = (woeid: string): void => {
    fetch(`http://localhost:3000/api/location/${woeid}`)
        .then((r) => r.json())
        .then(renderLocationResults);
};

preSearchResult.addEventListener('click', (e: Event): void => {

    const woeid = (e.target as HTMLButtonElement).dataset.woeid;
    const loader = () => loadLocationResults(woeid);
    loader();
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(loader, 1e4 * 36e2) as any as number;
});
form.addEventListener('submit', (e: Event): void => {
    e.preventDefault();
    if (!input.value) {
        return alert('Enter value');
    }

    fetch('http://localhost:3000/api/location?search=San')
        .then((r) => r.json())
        .then(renderSearchResults);

});