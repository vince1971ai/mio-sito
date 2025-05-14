const podcastList = document.getElementById('podcast-list');
const podcastSearch = document.getElementById('podcast-search');

// Dati dei podcast (sostituisci con i tuoi dati reali)
const podcasts = [
  {
    id: 1,
    title: "Podcast sull'Intelligenza Artificiale",
    description: "Un podcast che esplora le ultime novità nel mondo dell'IA.",
    imageUrl: "https://via.placeholder.com/300x200", // Sostituisci con l'URL reale
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Sostituisci con l'URL reale
    date: "2024-01-26",
    tags: ["AI", "Machine Learning", "Deep Learning"]
  },
  {
    id: 2,
    title: "Il Futuro dell'AI",
    description: "Discussioni sulle implicazioni etiche e sociali dell'IA.",
    imageUrl: "https://via.placeholder.com/300x200", // Sostituisci con l'URL reale
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Sostituisci con l'URL reale
    date: "2024-02-15",
    tags: ["AI", "Etica", "Società"]
  }
];

// Funzione per creare un elemento podcast
function createPodcastItem(podcast) {
  const item = document.createElement('div');
  item.classList.add('podcast-item');

  item.innerHTML = `
    <img src="${podcast.imageUrl}" alt="${podcast.title}">
    <h3>${podcast.title}</h3>
    <p>${podcast.description}</p>
    <audio controls>
      <source src="${podcast.audioUrl}" type="audio/mpeg">
      Il tuo browser non supporta l'elemento audio.
    </audio>
  `;

  return item;
}

// Funzione per popolare la lista dei podcast
function populatePodcastList() {
  podcastList.innerHTML = ''; // Pulisci la lista esistente

  podcasts.forEach(podcast => {
    const item = createPodcastItem(podcast);
    podcastList.appendChild(item);
  });
}

// Funzione per filtrare i podcast
function filterPodcasts(searchTerm) {
  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggiorna la lista con i podcast filtrati
  populatePodcastList(filteredPodcasts);
}

// Event listener per la ricerca
podcastSearch.addEventListener('input', (event) => {
  filterPodcasts(event.target.value);
});

// Inizializza la lista dei podcast
populatePodcastList();