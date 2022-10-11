export function fetchCountries(name) {
  const requestString = `https://restcountries.com/v3.1/name/${name}?fields=name,capital,population,flags,languages`;
  return fetch(requestString).then(response => {
    if (!response.ok) {
      if (response.status === 404) {
        // return [];
        throw new Error('Oops, there is no country with that name');
      }

      throw new Error(
        `Response status: ${response.statusText}. Code ${response.status}.`
      );
    }

    return response.json();
  });
}
