import { fetchImages } from './js/pixabay-api';
import { renderGallery, clearGallery } from './js/render-function';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.createElement('button');
loadMoreButton.textContent = 'Load more';
loadMoreButton.classList.add('load-more');
loadMoreButton.style.display = 'none';
galleryContainer.after(loadMoreButton);

let lightbox = new SimpleLightbox('.gallery a');
let query = '';
let page = 1;

form.addEventListener('submit', async e => {
  e.preventDefault();

  query = e.target.elements.searchQuery.value.trim();
  if (!query) {
    iziToast.error({ title: 'Error', message: 'Please enter a search term!' });
    return;
  }

  e.target.elements.searchQuery.value = '';
  clearGallery(galleryContainer);

  page = 1;
  toggleLoader(true);
  loadMoreButton.style.display = 'none';

  try {
    const data = await fetchImages(query, page);
    toggleLoader(false);

    if (data.hits.length === 0) {
      iziToast.error({
        message: `Sorry, no images found for "${query}". Please try again!`,
      });
      return;
    }

    renderImages(data.hits);
    lightbox.refresh();
    if (data.totalHits > data.hits.length) {
      loadMoreButton.style.display = 'block';
    }
  } catch (error) {
    toggleLoader(false);
    iziToast.error({ title: 'Error', message: error.message });
  }
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  toggleLoader(true);

  try {
    const data = await fetchImages(query, page);
    toggleLoader(false);

    renderImages(data.hits);
    lightbox.refresh();

    smoothScroll();

    if (page * 15 >= data.totalHits) {
      loadMoreButton.style.display = 'none';
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    toggleLoader(false);
    iziToast.error({ title: 'Error', message: error.message });
  }
});

function toggleLoader(show) {
  loader.style.display = show ? 'block' : 'none';
}

function renderImages(images) {
  const markup = renderGallery(images);
  galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
  const { height: cardHeight } =
    galleryContainer.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 1,
    behavior: 'smooth',
  });
}
