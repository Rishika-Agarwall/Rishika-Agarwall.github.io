document.addEventListener('DOMContentLoaded', () => {
  // === Theme Toggle Logic ===
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  
  // Set initial theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  htmlElement.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      text.textContent = 'Light Mode';
    } else {
      icon.className = 'fa-solid fa-moon';
      text.textContent = 'Dark Mode';
    }
  }

  // === Scroll Active Nav Highlight ===
  const sections = document.querySelectorAll('.content-section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Triggers slightly before the section reaches top
      if (window.scrollY >= sectionTop - 120) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // === Blog Form Expand/Collapse ===
  const formToggle = document.getElementById('blog-form-toggle');
  const addPostForm = document.getElementById('add-post-form');
  
  formToggle.addEventListener('click', () => {
    formToggle.classList.toggle('active');
    addPostForm.classList.toggle('collapsed');
  });

  // === Blog/Research Log Logic ===
  const blogPostsFeed = document.getElementById('blog-posts-feed');
  const postForm = document.getElementById('add-post-form');
  
  // Default mock research posts
  const defaultPosts = [
    {
      id: 1,
      title: 'Adversarial Prompting and Refusal Robustness in Clinical NLP Systems',
      category: 'Research Observation',
      date: 'May 25, 2026',
      content: 'Analyzed adversarial prompting vulnerabilities in clinical and educational contexts. Auditing custom GPT models for the "Krebs neu denken" prototype under Dr. Hendrik Mothes, I documented that standard defenses fail against roleplay or hypothetical scenario jailbreaks. In my research, I reviewed foundational studies on adversarial robustness in LLMs, such as the Universal Adversarial Attacks framework (https://arxiv.org/abs/2307.15043). I implemented structured system prompt boundaries and contextual compliance filters, ensuring the model successfully declines diagnostic reasoning requests while maintaining helpful, non-directive coping support. Ongoing work focuses on automated safety-probing pipelines.'
    },
    {
      id: 2,
      title: 'Literature Review: Unsupervised Product Alignment in E-Commerce Pipelines',
      category: 'Literature Review',
      date: 'June 08, 2026',
      content: 'Researched unsupervised image alignment and text fuzzy matching for e-commerce inventories. Product alignment across catalogs is difficult due to varying image angles, lighting, and metadata. I reviewed feature extraction techniques, comparing ResNet and Vision Transformers (ViTs) as discussed in unsupervised representation learning papers (such as SwAV: https://arxiv.org/abs/2006.09882). In my product matching system project, I built visual similarity pipelines using Python and OpenCV, combining image embeddings with text matching algorithms. I am currently co-authoring a paper focusing on these hybrid retrieval architectures.'
    }
  ];
  
  // Load posts from localStorage or load defaults
  let posts = JSON.parse(localStorage.getItem('research_posts'));
  const currentVersion = '2'; // Force reset cache for new defaults
  const savedVersion = localStorage.getItem('posts_version');
  
  if (!posts || posts.length === 0 || savedVersion !== currentVersion) {
    posts = defaultPosts;
    localStorage.setItem('research_posts', JSON.stringify(posts));
    localStorage.setItem('posts_version', currentVersion);
  }
  
  renderPosts();
  
  // Handle form submission
  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById('post-title');
    const categoryInput = document.getElementById('post-category');
    const contentInput = document.getElementById('post-content');
    
    const newPost = {
      id: Date.now(),
      title: titleInput.value,
      category: categoryInput.value,
      date: formatDate(new Date()),
      content: contentInput.value
    };
    
    posts.unshift(newPost); // Add new post to start of array
    localStorage.setItem('research_posts', JSON.stringify(posts));
    
    renderPosts();
    
    // Clear and collapse form
    postForm.reset();
    formToggle.classList.remove('active');
    addPostForm.classList.add('collapsed');
  });
  
  function renderPosts() {
    blogPostsFeed.innerHTML = '';
    
    if (posts.length === 0) {
      blogPostsFeed.innerHTML = '<p class="no-posts-msg">No research observations logged yet.</p>';
      return;
    }
    
    posts.forEach(post => {
      const escapedBody = escapeHTML(post.content);
      const linkifiedBody = escapedBody.replace(/(https?:\/\/[^\s\)]+)/g, '<a href="$1" target="_blank" class="blog-link">$1</a>');
      
      const card = document.createElement('article');
      card.className = 'blog-post-card';
      card.innerHTML = `
        <div class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-post-category">${escapeHTML(post.category)}</span>
            <span class="blog-post-date">${escapeHTML(post.date)}</span>
          </div>
        </div>
        <h3 class="blog-post-title">${escapeHTML(post.title)}</h3>
        <p class="blog-post-body">${linkifiedBody}</p>
        <button class="delete-post-btn" data-id="${post.id}" aria-label="Delete observation">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      `;
      blogPostsFeed.appendChild(card);
    });
    
    // Attach delete listeners
    const deleteButtons = blogPostsFeed.querySelectorAll('.delete-post-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        deletePost(id);
      });
    });
  }
  
  function deletePost(id) {
    posts = posts.filter(post => post.id !== id);
    localStorage.setItem('research_posts', JSON.stringify(posts));
    renderPosts();
  }
  
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
