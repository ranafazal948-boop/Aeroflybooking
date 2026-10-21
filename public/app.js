const airports = [
  ['LHR', 'London Heathrow'], ['EDI', 'Edinburgh'], ['MAN', 'Manchester'],
  ['BHD', 'Belfast City'], ['GLA', 'Glasgow'], ['ABZ', 'Aberdeen'],
  ['BRS', 'Bristol'], ['NCL', 'Newcastle'],
];
const origin = document.querySelector('#origin');
const destination = document.querySelector('#destination');
for (const select of [origin, destination]) {
  for (const [code, city] of airports) select.add(new Option(`${city} (${code})`, code));
}
origin.value = 'LHR';
destination.value = 'EDI';
const date = document.querySelector('#departure');
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
date.min = localDate;
date.value = localDate;
const message = document.querySelector('#search-message');
document.querySelector('#swap').addEventListener('click', () => {
  [origin.value, destination.value] = [destination.value, origin.value];
});
document.querySelectorAll('[data-origin]').forEach(link => {
  link.addEventListener('click', () => {
    origin.value = link.dataset.origin;
    destination.value = link.dataset.destination;
    document.querySelector('#search-title').textContent = 'Your route is ready to search.';
  });
});
document.querySelector('#flight-search').addEventListener('submit', event => {
  event.preventDefault();
  if (origin.value === destination.value) {
    message.textContent = 'Choose a different airport for your destination.';
    destination.focus();
    return;
  }
  if (!date.value || date.value < localDate) {
    message.textContent = 'Choose today or a future departure date.';
    date.focus();
    return;
  }
  const travellers = document.querySelector('#passengers').value;
  const query = `One way flights from ${origin.value} to ${destination.value} on ${date.value} for ${travellers} adult${travellers === '1' ? '' : 's'}`;
  const url = new URL('https://www.google.com/travel/flights');
  url.searchParams.set('q', query);
  window.location.assign(url.href);
});
