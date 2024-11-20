import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';


function addIconsToList(ulElement) {
  // Select all li elements within the given ul
  const listItems = ulElement.querySelectorAll('li');

  listItems.forEach(li => {
    // Find the <a> tag within each <li>
    const link = li.querySelector('a');
    if (link && link.title) {
      link.textContent = '';

      if (link.title.toLowerCase() === 'twitter') {
        // For Twitter, add an <img> element
        const imgElement = document.createElement('img');
        imgElement.src = '../../icons/x-white-logo.png';
        imgElement.alt = '';
        imgElement.className = 'img-twitter';

        // Append the <img> element to the <a> tag
        link.append(imgElement);
      } else {
        const iconElement = document.createElement('i');
        iconElement.className = `icon-${link.title.toLowerCase()}`;
        link.append(iconElement);
      }

      // Create a new <i> element with the desired class

    }
  });
}

function addCategoryClass(leftMenu) {
  // Select all first-level <li> elements within the .default-content-wrapper
  const topLevelItems = leftMenu.querySelectorAll('.default-content-wrapper > ul > li');

  topLevelItems.forEach(li => {
    // Add the 'category' class to each first-level <li> element
    li.classList.add('category');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const leftMenu = footer.querySelector('.left-menu');

  addCategoryClass(leftMenu);

  const rightMenu = footer.querySelector('.right-menu');

  const socialMediaLink = rightMenu.querySelector('.social-media ul');
  addIconsToList(socialMediaLink);

  const appStoreLink = rightMenu.querySelector('.app-store ul');
  const listItems = appStoreLink.querySelectorAll('li');

  listItems.forEach(li => {
    // Find the <a> tag within each <li>
    const link = li.querySelector('a');
    if (link && link.title) {
      link.textContent = '';

      if (link.title.toLowerCase().includes('apple')) {
        // For Twitter, add an <img> element
        const imgElement = document.createElement('img');
        imgElement.src = '../../icons/apple_app_store.svg';
        imgElement.alt = '';
        imgElement.className = 'img-app img-apple';

        // Append the <img> element to the <a> tag
        link.append(imgElement);
      } else if (link.title.toLowerCase().includes('google')) {
        // For Twitter, add an <img> element
        const imgElement = document.createElement('img');
        imgElement.src = '../../icons/google_play_store.svg';
        imgElement.alt = '';
        imgElement.className = 'img-app img-google';

        // Append the <img> element to the <a> tag
        link.append(imgElement);
      }

      // Create a new <i> element with the desired class

    }
  });



  block.append(footer);


}
