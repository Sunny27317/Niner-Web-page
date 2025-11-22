/* --------- 1. Auto-update footer year --------- */
document.querySelectorAll('#year, #year-2, #year-3, #year-4, #year-5').forEach(el => {
  if (el) el.textContent = new Date().getFullYear();
});

/* --------- 2. Load and display Events --------- */
async function loadEvents() {
  try {
    const res = await fetch('events.json');
    const events = await res.json();
    const tbody = document.getElementById('events-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Create table rows
    events.forEach((e, i) => {
      const tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.setAttribute('data-index', i);
      tr.innerHTML = `
        <td>${e.name}</td>
        <td>${e.date}</td>
        <td>${e.time}</td>
        <td>${e.location}</td>
      `;
      tr.addEventListener('click', () => showEventDetail(e));
      tr.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') showEventDetail(e); });
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load events', err);
  }
}

/* --------- 3. Search/Filter on Events Page --------- */
const searchInput = document.getElementById('search-events');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#events-body tr').forEach(tr => {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* --------- 4. Modal for Event Details --------- */
function showEventDetail(e) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h3>${e.name}</h3>
    <p><strong>Date:</strong> ${e.date} • <strong>Time:</strong> ${e.time}</p>
    <p><strong>Location:</strong> ${e.location}</p>
    <p>${e.description}</p>
    <p><a href="volunteer.html" class="btn btn-accent">Sign up to help</a></p>
  `;
  modal.querySelector('.modal-close').focus();
}
document.querySelectorAll('.modal .modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    modal.setAttribute('aria-hidden', 'true');
  });
});

/* --------- 5. Volunteer Form Handling --------- */
const volunteerForm = document.getElementById('volunteer-form');
if (volunteerForm) {
  volunteerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    const conf = document.getElementById('form-confirm');
    conf.setAttribute('aria-hidden', 'false');
    document.getElementById('confirm-body').innerHTML = `
      <h3>Thanks, ${data.name}!</h3>
      <p>Your volunteer request for <strong>${data.date}</strong> (${data.timeslot}) has been received.</p>
      <p>A confirmation email will be sent shortly (simulation).</p>
    `;
    conf.querySelector('.modal-close').focus();
    form.reset();
  });
}

/* --------- 6. Contact Form Handling --------- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    alert('Message sent successfully! (Simulated)');
    form.reset();
  });
}

/* --------- 7. FAQ Accordion --------- */
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const open = panel.style.display === 'block';
    document.querySelectorAll('.accordion-panel').forEach(p => p.style.display = 'none');
    panel.style.display = open ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!open));
  });
});

/* --------- 8. Impact Chart & Stats --------- */
async function loadImpact() {
  try {
    const res = await fetch('impact.json');
    const data = await res.json();

    // Populate summary stats (Home page + Impact)
    document.querySelectorAll('.stat-value, .stat-number').forEach(el => {
      const key = el.dataset.key;
      if (key && data.summary[key] !== undefined) el.textContent = data.summary[key];
    });

    // Create chart
    const chart = document.getElementById('chart');
    if (chart) {
      chart.innerHTML = '';
      const max = Math.max(...data.weekly.map(d => d.meals));
      data.weekly.forEach(d => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = Math.round((d.meals / max) * 100);
        bar.innerHTML = `<div style="height:${height}%"></div><small>${d.week}</small>`;
        chart.appendChild(bar);
      });
    }

    // Partner list
    const list = document.getElementById('partners-list');
    if (list) {
      list.innerHTML = '';
      data.partners.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Impact data failed to load', err);
  }
}

/* --------- 9. Carousel Functionality --------- */
function initCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const indicators = carousel.querySelectorAll('.indicator');
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  function showSlide(index) {
    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % totalSlides);
  }

  function prevSlide() {
    showSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }

  // Event listeners
  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index));
  });

  // Auto-advance
  setInterval(nextSlide, 5000);
}

/* --------- 10. Tabbed Interface --------- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      // Update contents
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Animate progress bars
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach(bar => {
    const target = bar.dataset.target;
    setTimeout(() => {
      bar.style.width = `${target}%`;
    }, 500);
  });
}

/* --------- 11. Gallery Modal --------- */
function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('gallery-modal-img');
  const modalCaption = document.getElementById('gallery-modal-caption');
  const closeBtn = modal.querySelector('.gallery-modal-close');
  const prevBtn = modal.querySelector('.gallery-nav-btn.prev');
  const nextBtn = modal.querySelector('.gallery-nav-btn.next');

  let currentImageIndex = 0;
  const images = Array.from(galleryItems);

  function openModal(index) {
    const img = images[index].querySelector('img');
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalCaption.textContent = img.dataset.caption;
    currentImageIndex = index;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function nextImage() {
    openModal((currentImageIndex + 1) % images.length);
  }

  function prevImage() {
    openModal((currentImageIndex - 1 + images.length) % images.length);
  }

  // Event listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openModal(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openModal(index);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);

  // Keyboard navigation
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* --------- 12. Initialize All Components --------- */
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  loadImpact();
  initCarousel();
  initTabs();
  initGallery();
});