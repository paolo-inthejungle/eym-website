// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');
const papersList = document.getElementById('papers-list');
const emptyState = document.getElementById('empty-state');

function applyFilter(type) {
    const cards = papersList.querySelectorAll('.paper-card');

    cards.forEach(card => {
        const match = type === 'all' || card.dataset.type === type;
        card.classList.toggle('hidden', !match);
    });

    // Show empty state if no visible cards
    const visible = [...cards].filter(c => !c.classList.contains('hidden'));
    emptyState.style.display = (cards.length === 0 || visible.length === 0) ? 'block' : 'none';
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
    });
});

// Init: show empty state if no papers
if (papersList.children.length === 0) {
    emptyState.style.display = 'block';
}

/*
 * HOW TO ADD A PAPER (until the CMS is ready):
 *
 * Add a <div> inside <div id="papers-list"> with this structure:
 *
 * <div class="paper-card" data-type="position">   ← position | article | brief
 *   <div class="paper-meta">
 *     <span class="paper-badge position">Position Paper</span>
 *     <div class="paper-title">Title of the paper</div>
 *     <div class="paper-info">Author · Month Year</div>
 *     <div class="paper-desc">Short description of the paper.</div>
 *   </div>
 *   <a href="../papers/filename.pdf" download class="paper-download">⬇ Download</a>
 * </div>
 */
