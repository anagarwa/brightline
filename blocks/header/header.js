import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}


async function addEvents(block) {
  const navDrops = block.querySelectorAll('.nav-drop');

// Function to toggle dropdown visibility on click
  function toggleDropdown(event) {
    event.stopPropagation(); // Prevent click from bubbling up
    this.classList.toggle('show');
  }

// Function to show dropdown on hover
  function showDropdown() {
    this.classList.add('show');
  }

// Function to hide dropdown on hover
  function hideDropdown() {
    this.classList.remove('show');
  }

// Attach event listeners to each nav-drop
  navDrops.forEach(navDrop => {
    // Toggle dropdown on click
    navDrop.addEventListener('click', toggleDropdown);

    // Show dropdown on hover
    navDrop.addEventListener('mouseenter', showDropdown);
    navDrop.addEventListener('mouseleave', hideDropdown);
  });

// Close all dropdowns if clicking outside any nav-drop
  document.addEventListener('click', function(event) {
    navDrops.forEach(navDrop => {
      if (!navDrop.contains(event.target)) {
        navDrop.classList.remove('show');
      }
    });
  });

  const menu_wrapper = block.querySelector(".menu-wrapper");
  const hamburger = block.querySelector(".nav-hamburger");
  const closeIcon = block.querySelector(".nav-close");

  hamburger.addEventListener("click", () => {
    menu_wrapper.classList.toggle("menu-open");
    hamburger.classList.add("menu-open");
    closeIcon.classList.add("menu-open");
  });

  closeIcon.addEventListener("click", () => {
    menu_wrapper.classList.remove("menu-open");
    hamburger.classList.remove("menu-open");
    closeIcon.classList.remove("menu-open");
  });

}

function addIconsToNavDrop(block) {
  // Select all elements with class 'nav-drop'
  const navDropElements = block.querySelectorAll(".nav-drop");

  navDropElements.forEach((navDrop) => {
    // Create the span element
    const iconSpan = document.createElement("span");
    iconSpan.classList.add("nav-icons");

    // Create the up arrow icon
    const upArrow = document.createElement("i");
    upArrow.classList.add("icon-arrow-up"); // Add your icon class here

    // Create the close icon
    const closeIcon = document.createElement("i");
    closeIcon.classList.add("icon-arrow-down"); // Add your icon class here

    // Append icons to span
    iconSpan.appendChild(upArrow);
    iconSpan.appendChild(closeIcon);

    // Append the span to the nav-drop element
    navDrop.insertBefore(iconSpan, navDrop.children[0]);
  });
}

function addIconsToTopMenu(block) {
  const menuItems = block.querySelectorAll(".top-menu ul li");

  menuItems.forEach(item => {
    const itemText = item.textContent.toLowerCase(); // Convert text content to lowercase

    // Check if the item contains the text 'trips' (case-insensitive)
    if (itemText.includes("trips")) {
      const icon = document.createElement("i");
      icon.classList.add("icon-briefcase"); // Add the briefcase icon
      item.prepend(icon); // Insert icon before the text
    }
    // Check if the item contains the text 'login' (case-insensitive)
    else if (itemText.includes("login")) {
      const icon = document.createElement("i");
      icon.classList.add("icon-login"); // Add the login icon
      item.prepend(icon); // Insert icon before the text
    }
  });
}
/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  const picture = nav.querySelector('picture');
  if (picture) {
    picture.remove();
    // const pictureLink = document.createElement('a');
    // pictureLink.href = '/';
    // pictureLink.append(picture);
    // nav.prepend(pictureLink);
  }

  const menuWrapper = document.createElement('div');
  menuWrapper.className = 'menu-wrapper';
  const topMenu = nav.querySelector('.top-menu ul');
  if (topMenu) {
    const topMenuDiv = document.createElement('div');
    topMenuDiv.className = 'top-menu';
    topMenuDiv.append(topMenu);
    menuWrapper.append(topMenuDiv);
  }

  const primaryMenu = nav.querySelector('.primary-menu ul');
  if (primaryMenu) {
    const buttonLink = document.createElement('a');
    buttonLink.href = '/';
    buttonLink.textContent = nav.querySelector('.primary-button ul li').textContent;
    const tempLi = document.createElement('li');
    tempLi.append(buttonLink);
    primaryMenu.append(tempLi);
    const primaryMenuDiv = document.createElement('div');
    primaryMenuDiv.className = 'primary-menu';
    primaryMenuDiv.append(primaryMenu);
    menuWrapper.append(primaryMenuDiv);
  }
  nav.textContent = '';
  const pictureLink = document.createElement('a');
  pictureLink.className = 'nav-brand';
  pictureLink.href = '/';
  pictureLink.append(picture);
  // const pictureDiv = document.createElement('div');
  //   pictureDiv.className = 'nav-brand';
  //   pictureDiv.append(pictureLink);
  nav.append(pictureLink);


  const navMobileHandle = document.createElement('div');
  navMobileHandle.className = 'nav-mobile-handle';
  const openMenuButton = document.createElement('div');
  openMenuButton.classList.add('nav-hamburger');
  openMenuButton.innerHTML = `
      <span class="icon-hamburger"></span>
  `;
  navMobileHandle.append(openMenuButton);

  const closeMenuButton = document.createElement('div');
  closeMenuButton.classList.add('nav-close');
  closeMenuButton.innerHTML = `<span class="icon-close"></span>`;
  navMobileHandle.append(closeMenuButton);

  nav.append(navMobileHandle);
  nav.append(menuWrapper);
  block.append(navWrapper);
  addIconsToNavDrop(block);
  addIconsToTopMenu(block);
  addEvents(block);

}
