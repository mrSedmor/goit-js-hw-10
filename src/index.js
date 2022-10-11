import './css/styles.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

import { fetchCountries } from './fetchCountries';

// import makeCountriesList from './templates/countries-list.pug';
// import makeCountryInfo from './templates/country-info.pug';

const DEBOUNCE_DELAY = 300;

const searchInputElem = document.querySelector('#search-box');
const countryListElem = document.querySelector('.country-list');
const countryInfoElem = document.querySelector('.country-info');

const countryListMap = new WeakMap();

searchInputElem.addEventListener(
  'input',
  debounce(event => {
    renderCountries(event.target.value.trim());
  }, DEBOUNCE_DELAY)
);

countryListElem.addEventListener('click', event => {
  const target = event.target.closest('.country-item');

  if (!target) {
    return;
  }

  const country = countryListMap.get(target);
  searchInputElem.value = country.name;

  countryListElem.innerHTML = '';
  renderCountryInfo(country);
});

function renderCountries(countryName) {
  if (countryName === '') {
    clearCountryElems();
    return;
  }

  fetchCountries(countryName)
    .then(mapContriesFields)
    .finally(clearCountryElems)
    .then(countries => {
      // impossible case:
      // if (countries.length === 0) return;

      if (countries.length > 10) {
        Notiflix.Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
        return;
      }

      if (countries.length > 1) {
        renderCountriesList(countries);
        return;
      }

      // if (countries.length === 1)
      renderCountryInfo(countries[0]);
    })
    .catch(error => {
      Notiflix.Notify.failure(error.message);
    });
}

function clearCountryElems() {
  countryListElem.innerHTML = '';
  countryInfoElem.innerHTML = '';
}

function mapContriesFields(countries) {
  return countries.map(({ name, capital, population, flags, languages }) => ({
    name: name.official,
    capital: capital[0],
    population,
    flag: flags.svg,
    languages: Object.values(languages),
  }));
}

function renderCountryInfo(country) {
  countryInfoElem.innerHTML = `
    <h2 class="country-title">
      <img class="country-flag" src="${country.flag}" alt="Flag" width="50"
      >${country.name}
    </h2>
    <p class="country-detail"><span class="country-parameter">Capital: </span
    >${country.capital}</p>
    <p class="country-detail"><span class="country-parameter">Population: </span
    >${country.population}</p>
    <p class="country-detail"><span class="country-parameter">Languages: </span
    >${country.languages.join(', ')}</p>`;
}

function renderCountriesList(countries) {
  const countryListItems = countries.map(country => {
    const countryItemElem = document.createElement('li');
    countryItemElem.classList.add('country-item');
    countryItemElem.innerHTML = `
        <img class="country-flag" src="${country.flag}" alt="Flag" width="40">
        <span class="country-name">${country.name}</span>`;

    countryListMap.set(countryItemElem, country);

    return countryItemElem;
  });

  // We are removing entities of country list.
  // Will garbage collector remove entries from countryListMap?
  countryListElem.replaceChildren(...countryListItems);
}
