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

  // === Admin Mode Check ===
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';
  const adminForm = document.getElementById('admin-only-form');
  
  if (isAdmin && adminForm) {
    adminForm.style.display = 'block';
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
      title: 'LLM Safety and Alignment via NeMo Guardrails',
      category: 'Research Observation',
      date: 'June 08, 2026',
      content: 'Explored NVIDIA NeMo Guardrails for configuring execution flows and safety boundaries in LLM systems. I studied how colang files can be used to steer models away from prohibited topics (such as diagnostic or medical advice) and direct them towards safety-compliant responses. This programmatic approach to alignment ensures robust execution paths, preventing jailbreaks and prompt injections far more effectively than standard system prompts.'
    },
    {
      id: 3,
      title: 'Stateful Multi-Agent Workflows with LangGraph',
      category: 'Research Observation',
      date: 'June 12, 2026',
      content: 'Investigated LangGraph for building stateful, multi-agent systems with cyclic graphs. By defining explicit node states and edge transitions, we can orchestrate complex reasoning paths where separate LLM agents collaborate (e.g., one for generation, one for factuality auditing). This setup provides precise control over agent behavior, facilitating error recovery and structured output validation in production environments.'
    }
  ];
  
  // Load posts from localStorage or load defaults
  let posts = JSON.parse(localStorage.getItem('research_posts'));
  const currentVersion = '5'; // Force reset cache for new admin layout
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
    const passcodeInput = document.getElementById('post-passcode');
    
    // Admin verification passcode
    if (passcodeInput.value !== 'rishika2026') {
      alert('Unauthorized: Invalid admin passcode. Only the portfolio owner can post observations.');
      return;
    }
    
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
    
    const allComments = JSON.parse(localStorage.getItem('post_comments')) || {};
    
    posts.forEach(post => {
      const escapedBody = escapeHTML(post.content);
      const linkifiedBody = escapedBody.replace(/(https?:\/\/[^\s\)]+)/g, '<a href="$1" target="_blank" class="blog-link">$1</a>');
      const comments = allComments[post.id] || [];
      const commentCount = comments.length;
      
      let commentsHtml = '';
      if (comments.length === 0) {
        commentsHtml = `<p class="no-comments-msg" id="no-comments-msg-${post.id}">No comments yet. Be the first to comment!</p>`;
      } else {
        comments.forEach(c => {
          commentsHtml += `
            <div class="comment-item">
              <div class="comment-meta">
                <span class="comment-author">${escapeHTML(c.author)}</span>
                <span class="comment-date">${escapeHTML(c.date)}</span>
              </div>
              <p class="comment-text-body">${escapeHTML(c.text)}</p>
            </div>
          `;
        });
      }
      
      const deleteButtonHtml = isAdmin ? `
        <button class="delete-post-btn" data-id="${post.id}" aria-label="Delete observation">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      ` : '';
      
      const card = document.createElement('article');
      card.className = 'blog-post-card';
      card.innerHTML = `
        <div class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-post-category">${escapeHTML(post.category)}</span>
            <span class="blog-post-date">${escapeHTML(post.date)}</span>
          </div>
          ${deleteButtonHtml}
        </div>
        <h3 class="blog-post-title">${escapeHTML(post.title)}</h3>
        <p class="blog-post-body">${linkifiedBody}</p>
        
        <div class="comments-section">
          <button class="toggle-comments-btn" data-id="${post.id}">
            <i class="fa-regular fa-comments"></i> Comments (<span class="comment-count-${post.id}">${commentCount}</span>)
            <i class="fa-solid fa-chevron-down comment-chevron"></i>
          </button>
          <div class="comments-container collapsed" id="comments-container-${post.id}">
            <div class="comments-list" id="comments-list-${post.id}">
              ${commentsHtml}
            </div>
            <form class="add-comment-form" data-post-id="${post.id}">
              <div class="comment-form-row">
                <input type="text" class="comment-author-input" id="comment-author-${post.id}" placeholder="Your Name" required>
                <button type="submit" class="comment-submit-btn">Post Comment</button>
              </div>
              <textarea class="comment-text-input" id="comment-text-${post.id}" rows="2" placeholder="Add a comment..." required></textarea>
            </form>
          </div>
        </div>
      `;
      blogPostsFeed.appendChild(card);
    });
    
    if (isAdmin) {
      // Bind delete listeners
      const deleteButtons = blogPostsFeed.querySelectorAll('.delete-post-btn');
      deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          deletePost(id);
        });
      });
    }
    
    // Bind toggle comments listeners
    const toggleCommentsBtns = blogPostsFeed.querySelectorAll('.toggle-comments-btn');
    toggleCommentsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-id');
        const container = document.getElementById(`comments-container-${postId}`);
        container.classList.toggle('collapsed');
        btn.querySelector('.comment-chevron').classList.toggle('rotated');
      });
    });
    
    // Bind add comment form submission listeners
    const commentForms = blogPostsFeed.querySelectorAll('.add-comment-form');
    commentForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const postId = form.getAttribute('data-post-id');
        const authorInput = document.getElementById(`comment-author-${postId}`);
        const textInput = document.getElementById(`comment-text-${postId}`);
        
        const newComment = {
          id: Date.now(),
          author: authorInput.value,
          text: textInput.value,
          date: formatDate(new Date())
        };
        
        let allComments = JSON.parse(localStorage.getItem('post_comments')) || {};
        if (!allComments[postId]) {
          allComments[postId] = [];
        }
        allComments[postId].push(newComment);
        localStorage.setItem('post_comments', JSON.stringify(allComments));
        
        renderCommentsForPost(postId);
        form.reset();
      });
    });
  }
  
  function renderCommentsForPost(postId) {
    const allComments = JSON.parse(localStorage.getItem('post_comments')) || {};
    const comments = allComments[postId] || [];
    const listContainer = document.getElementById(`comments-list-${postId}`);
    const countSpan = document.querySelector(`.comment-count-${postId}`);
    
    countSpan.textContent = comments.length;
    
    if (comments.length === 0) {
      listContainer.innerHTML = `<p class="no-comments-msg" id="no-comments-msg-${postId}">No comments yet. Be the first to comment!</p>`;
      return;
    }
    
    let commentsHtml = '';
    comments.forEach(c => {
      commentsHtml += `
        <div class="comment-item">
          <div class="comment-meta">
            <span class="comment-author">${escapeHTML(c.author)}</span>
            <span class="comment-date">${escapeHTML(c.date)}</span>
          </div>
          <p class="comment-text-body">${escapeHTML(c.text)}</p>
        </div>
      `;
    });
    listContainer.innerHTML = commentsHtml;
  }
  
  function deletePost(id) {
    const code = prompt("Enter admin passcode to delete this observation:");
    if (code !== 'rishika2026') {
      alert("Unauthorized: Invalid passcode.");
      return;
    }
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
