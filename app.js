/* Between the Pages: a public, static reading-room site with an optional local-only author desk. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const publicCatalogue = Array.isArray(window.BOOK_CATALOG) ? window.BOOK_CATALOG : [];
  const editorMode = new URLSearchParams(location.search).get('edit') === '1';
  const DRAFT_KEY = 'between-pages-author-draft-v1';
  const THEME_KEY = 'between-pages-theme-v1';
  const shades = {sage:'#587268',rust:'#965d50',ink:'#42566a',plum:'#815764',ochre:'#987c48',blue:'#4c6c83',moss:'#59684a',clay:'#9b7962'};
  const statusNames = {finished:'Finished',reading:'Currently reading',rereading:'Rereading',paused:'On pause','to-confirm':'To confirm'};
  const clone = (val) => JSON.parse(JSON.stringify(val));
  const safeText = (value) => (value === null || value === undefined ? '' : String(value));
  function readDraft(){try {const val=JSON.parse(localStorage.getItem(DRAFT_KEY));return Array.isArray(val) ? val : null;} catch{return null;}}
  let books = clone((editorMode && readDraft()) || publicCatalogue);
  let activeBookId = null;
  let lastFocus = null;
  let editingBookId = null;

  function el(tag, className, txt){const node=document.createElement(tag); if(className)node.className=className; if(txt!==undefined)node.textContent=safeText(txt); return node;}
  function colorFor(book){return shades[book.color] || shades.ink;}
  function coverURL(book,size='M'){
    if(book.coverId && /^\d+$/.test(String(book.coverId))) return `https://covers.openlibrary.org/b/id/${book.coverId}-${size}.jpg?default=false`;
    if(book.isbn && /^\d{10}(?:\d{3})?$/.test(String(book.isbn).replace(/-/g,'')))return `https://covers.openlibrary.org/b/isbn/${String(book.isbn).replace(/-/g,'')}-${size}.jpg?default=false`;
    return '';
  }
  function coverFallback(book){
    const art=el('div','cover-art');art.style.setProperty('--fallback',colorFor(book));
    art.append(el('em','', '✧'),el('strong','',book.title),el('small','',book.author));return art;
  }
  function bookCover(book,size='M'){
    const stack=el('div','cover-stack');stack.append(coverFallback(book));
    const imgURL=coverURL(book,size);
    if(!imgURL)return stack;
    const picture=el('img','remote-cover'); picture.src=imgURL;picture.alt=`Cover of ${book.title}`;picture.loading='lazy';picture.decoding='async';
    picture.addEventListener('load',()=>stack.classList.add('loaded'),{once:true});
    picture.addEventListener('error',()=>picture.remove(),{once:true});
    stack.append(picture);return stack;
  }
  function libraryLink(book){
    if(book.isbn && /^\d{10}(?:\d{3})?$/.test(String(book.isbn).replace(/-/g,'')))return `https://openlibrary.org/isbn/${String(book.isbn).replace(/-/g,'')}`;
    return '';
  }
  function setTheme(theme){
    const night=theme==='night';document.body.classList.toggle('theme-night',night);document.body.classList.toggle('theme-day',!night);
    $('themeToggle').querySelector('.theme-label').textContent=night?'Daylight reading room':'Midnight library';
    $('themeToggle').querySelector('.theme-icon').textContent=night?'☼':'☾';
    $('themeToggle').title=night?'Switch to daylight reading room':'Switch to the Midnight Library';
    document.querySelector('meta[name="theme-color"]').setAttribute('content',night?'#10231f':'#f3eee5');
    try{localStorage.setItem(THEME_KEY,theme)}catch{}
  }
  let initialTheme='day';try{initialTheme=localStorage.getItem(THEME_KEY)||'day'}catch{}
  setTheme(initialTheme);
  $('themeToggle').addEventListener('click',()=>setTheme(document.body.classList.contains('theme-night')?'day':'night'));

  function openBook(id){
    const book=books.find(b=>b.id===id);if(!book)return;
    activeBookId=id;lastFocus=document.activeElement;
    $('dialogTitle').textContent=book.title;$('dialogAuthor').textContent=book.author;
    $('dialogStatus').textContent=statusNames[book.status]||book.status;
    const meta=$('dialogMeta');meta.replaceChildren();
    if(book.genre)meta.append(el('span','',book.genre));if(book.year)meta.append(el('span','',`First published ${book.year}`));
    if(book.rating)meta.append(el('span','',`${book.rating} / 5 reader rating`));
    const progress=$('dialogProgress');const hasProgress=(book.status==='reading'||book.status==='rereading'||book.status==='paused')&&Number.isFinite(Number(book.progress))&&book.progress!==''&&book.progress!==null&&Number(book.progress)>0;
    progress.hidden=!hasProgress;
    if(hasProgress){const val=Math.min(100,Math.max(0,Number(book.progress)));$('dialogProgressBar').style.width=`${val}%`;$('dialogProgressNum').textContent=`${val}%`;}
    const cover=$('dialogCover');cover.replaceChildren(bookCover(book,'L'));
    const notes=$('publishedNotes');notes.replaceChildren();
    if(book.note){notes.append(el('p','note-label','Between the pages'),el('p','note-text',book.note));}
    if(book.reflection){notes.append(el('p','note-label','After the last page'),el('p','note-text',book.reflection));}
    if(!book.note&&!book.reflection){notes.append(el('p','note-empty','This journal page is waiting for its first entry.'));}
    const link=$('openLibraryLink');const target=libraryLink(book);link.hidden=!target;if(target)link.href=target;
    $('editThisBook').hidden=!editorMode;
    $('dialogOverlay').hidden=false;document.body.style.overflow='hidden';$('bookDialog').focus();
  }
  function closeBook(){
    if($('dialogOverlay').hidden)return;$('dialogOverlay').hidden=true;document.body.style.overflow='';activeBookId=null;if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
  }
  $('dialogClose').addEventListener('click',closeBook);
  $('dialogOverlay').addEventListener('click',e=>{if(e.target===$('dialogOverlay'))closeBook()});
  $('editThisBook').addEventListener('click',()=>{const id=activeBookId;closeBook();openEditor(id)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('editOverlay').hidden)closeEditor();else closeBook()};if(e.key==='Tab'&&!$('dialogOverlay').hidden){const focusables=[...$('bookDialog').querySelectorAll('button:not([hidden]),a:not([hidden])')];const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});

  function heroFeatured(){
    const titles=['Jane Eyre','1984','The Martian','The Thursday Murder Club','The Midnight Library','Project Hail Mary','Crime and Punishment','The Untethered Soul','The Rosie Project','Dune','The Silence of the Lambs','Chip War','Seveneves','The Flatshare','Foundation','Rebecca','The Order of Time','Harry Potter and the Order of the Phoenix','The Da Vinci Code','The Silent Patient','The Bullet That Missed','Artemis','The Garden of Small Beginnings','The Science of Interstellar','The Very Secret Society of Irregular Witches','Moonflower Murders','Red Dragon','The Hot Zone'];
    return titles.map(t=>books.find(b=>b.title===t)).filter(Boolean);
  }
  function drawHero(){
    const featured=heroFeatured();const halves=[featured.slice(0,14),featured.slice(14,28)];
    ['heroShelf1','heroShelf2'].forEach((id,index)=>{
      const shelf=$(id);shelf.replaceChildren();halves[index].forEach((book,i)=>{
        const btn=el('button','spine');btn.type='button';btn.title=`${book.title} — ${book.author}`;btn.setAttribute('aria-label',`Open ${book.title} by ${book.author}`);
        const width=33+(i*13+index*7)%19;const height=86+(i*17+index*21)%37;
        btn.style.setProperty('--spine',colorFor(book));btn.style.setProperty('--spine-w',`${width}px`);btn.style.setProperty('--spine-h',`${height}px`);
        if(['ochre','clay'].includes(book.color))btn.classList.add('pale');
        btn.append(el('span','spine-label',book.title),el('span','spine-star','✧'));
        btn.addEventListener('click',()=>openBook(book.id));shelf.append(btn);
      });
    });
    const reading=$('readingNow');reading.replaceChildren();
    books.filter(b=>b.status==='reading').slice(0,2).forEach(book=>{
      const item=el('div','reading-list');const btn=el('button','',book.title);btn.type='button';btn.addEventListener('click',()=>openBook(book.id));
      item.append(btn,el('small','',book.author));
      if(book.progress>0){const track=el('div','tiny-track');const fill=el('i');fill.style.width=`${Math.min(100,book.progress)}%`;track.append(fill);item.append(track)}reading.append(item);
    });
    if(!reading.childNodes.length)reading.append(el('div','reading-list','No current reads listed.'));
  }
  function renderGenreFilter(){const menu=$('genreFilter');const current=menu.value;const genres=[...new Set(books.map(b=>b.genre).filter(Boolean))].sort((a,b)=>a.localeCompare(b));menu.replaceChildren(new Option('All genres','all'));genres.forEach(g=>menu.add(new Option(g,g)));menu.value=genres.includes(current)?current:'all'}
  function visibleBooks(){const search=$('searchInput').value.trim().toLocaleLowerCase();const status=$('statusFilter').value, genre=$('genreFilter').value;
    return books.filter(b=>(!search||`${b.title} ${b.author} ${b.genre}`.toLocaleLowerCase().includes(search))&&(status==='all'||b.status===status)&&(genre==='all'||b.genre===genre));}
  function drawLibrary(){
    const result=visibleBooks();const container=$('libraryShelves');container.replaceChildren();
    const groupSize=8;for(let n=0;n<result.length;n+=groupSize){
      const shelf=el('div','shelf-row');shelf.setAttribute('aria-label',`Shelf ${n/groupSize+1}`);
      result.slice(n,n+groupSize).forEach(book=>{
        const btn=el('button','book-cover-button');btn.type='button';btn.setAttribute('aria-label',`Open ${book.title} by ${book.author}`);btn.title=`${book.title} · ${book.author} · ${statusNames[book.status]||''}`;
        btn.append(bookCover(book,'M'));btn.addEventListener('click',()=>openBook(book.id));shelf.append(btn);
      });container.append(shelf);
    }
    const shelfTotal=Math.ceil(result.length/groupSize);$('resultCount').textContent=`Showing ${result.length} of ${books.length} books · ${shelfTotal} ${shelfTotal===1?'shelf':'shelves'}`;
    $('libraryCount').textContent=`${books.length} books & counting`;$('emptyState').hidden=result.length>0;
  }
  function drawJournal(){
    const entries=books.filter(b=>(b.note||b.reflection)&&b.featured);const fallback=books.filter(b=>b.note||b.reflection);const pick=entries[0]||fallback[0];
    $('noteCounter').textContent=pick?'001':'—';$('readJournalBtn').hidden=!pick;
    if(pick){$('featuredJournalTitle').textContent=pick.title;$('featuredJournalAuthor').textContent=pick.author;$('featuredJournalText').textContent=pick.note||pick.reflection;
      $('readJournalBtn').onclick=()=>openBook(pick.id);
    }else{$('featuredJournalTitle').textContent='A space for reflection';$('featuredJournalAuthor').textContent='The first public journal entry is yet to be added.';$('featuredJournalText').textContent='For thoughts, passages, questions, and ideas worth returning to.'}
  }
  function drawStats(){
    $('statTotal').textContent=books.length;$('statFinished').textContent=books.filter(b=>b.status==='finished').length;
    $('statReading').textContent=books.filter(b=>b.status==='reading').length;$('statPaused').textContent=books.filter(b=>b.status==='paused').length;
    const year=new Date().getFullYear();$('currentYear').textContent=year;
    const dated=books.filter(b=>/^\d{4}-\d\d-\d\d$/.test(b.finishedOn||''));$('statYear').textContent=dated.length?dated.filter(b=>b.finishedOn.startsWith(String(year))).length:'—';
  }
  function renderAll(){drawHero();renderGenreFilter();drawLibrary();drawJournal();drawStats()}
  $('searchInput').addEventListener('input',drawLibrary);$('statusFilter').addEventListener('change',drawLibrary);$('genreFilter').addEventListener('change',drawLibrary);
  $('clearFilters').addEventListener('click',()=>{$('searchInput').value='';$('statusFilter').value='all';$('genreFilter').value='all';drawLibrary()});
  $('surpriseBtn').addEventListener('click',()=>{const matches=visibleBooks();if(matches.length)openBook(matches[Math.floor(Math.random()*matches.length)].id)});

  function persistDraft(){if(!editorMode)return;try{localStorage.setItem(DRAFT_KEY,JSON.stringify(books));setMessage('Saved locally. Export books.js when ready to publish.')}catch{setMessage('Browser storage unavailable. Export your changes now.')}}
  function setMessage(s){if($('editorMessage'))$('editorMessage').textContent=s}
  function download(filename,text,mime){const link=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:mime}));link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
  function validateLibrary(parsed){return Array.isArray(parsed)&&parsed.every(b=>b&&typeof b.title==='string'&&typeof b.author==='string'&&typeof b.id==='string')}
  function editorInit(){
    if(!editorMode)return;
    $('editorDock').hidden=false;$('editorEntry').textContent='Editor mode active';
    $('editorClose').addEventListener('click',()=>{$('editorBody').hidden=!$('editorBody').hidden;$('editorClose').textContent=$('editorBody').hidden?'+':'−'});
    $('addBook').addEventListener('click',()=>openEditor(null));
    $('exportBookJs').addEventListener('click',()=>{const output='/* Public library catalogue — generated in the editor desk. */\nwindow.BOOK_CATALOG = '+JSON.stringify(books,null,2)+';\n';download('books.js',output,'text/javascript');setMessage('Downloaded books.js — replace data/books.js in the website repository and commit.')});
    $('exportJson').addEventListener('click',()=>{download('reading-library-backup.json',JSON.stringify(books,null,2)+'\n','application/json');setMessage('Downloaded a JSON backup.')});
    $('resetLocal').addEventListener('click',()=>{if(!confirm('Discard every locally edited entry and return to the currently published catalogue?'))return;localStorage.removeItem(DRAFT_KEY);books=clone(publicCatalogue);renderAll();setMessage('Local edits discarded.')});
    $('importFile').addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{let raw=await file.text();if(file.name.endsWith('.js'))raw=raw.replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?window\.BOOK_CATALOG\s*=\s*/,'').replace(/;\s*$/,'');const next=JSON.parse(raw);if(!validateLibrary(next))throw Error('Incorrect book fields');
        if(!confirm(`Replace the local editor catalogue with ${next.length} imported books?`))return;
        books=next;persistDraft();renderAll();setMessage(`${next.length} entries imported on this device.`);
      }catch{setMessage('Import failed. Select an exported books.js or JSON backup.')}finally{e.target.value=''}
    });
    $('editClose').addEventListener('click',closeEditor);
    $('editOverlay').addEventListener('click',e=>{if(e.target===$('editOverlay'))closeEditor()});
    $('editForm').addEventListener('submit',saveEdit);
    $('editDelete').addEventListener('click',()=>{
      if(!editingBookId)return;if(!confirm('Remove this book from your local catalogue?'))return;
      books=books.filter(b=>b.id!==editingBookId);persistDraft();closeEditor();renderAll();
    });
    if(readDraft())setMessage('Loaded existing local draft. Export to publish changes.');
  }
  function openEditor(id){if(!editorMode)return;editingBookId=id;const b=id?books.find(x=>x.id===id):null;
    $('editTitle').textContent=b?'Edit a journal page':'Add a new book';$('editDelete').hidden=!b;
    $('fieldId').value=b?.id||'';$('fieldTitle').value=b?.title||'';$('fieldAuthor').value=b?.author||'';$('fieldGenre').value=b?.genre||'';
    $('fieldYear').value=b?.year||'';$('fieldStatus').value=b?.status||'to-confirm';$('fieldProgress').value=b?.progress??'';$('fieldFinished').value=b?.finishedOn||'';
    $('fieldRating').value=b?.rating||'';$('fieldIsbn').value=b?.isbn||'';$('fieldCoverId').value=b?.coverId||'';$('fieldNote').value=b?.note||'';
    $('fieldReflection').value=b?.reflection||'';$('fieldFeatured').checked=!!b?.featured;
    $('editOverlay').hidden=false;document.body.style.overflow='hidden';$('fieldTitle').focus();
  }
  function closeEditor(){$('editOverlay').hidden=true;document.body.style.overflow='';}
  function saveEdit(e){e.preventDefault();if(!editorMode)return;
    const prev=books.find(b=>b.id===editingBookId);const id=editingBookId||`book-${Date.now()}`;
    const progress=$('fieldProgress').value.trim();const isbn=$('fieldIsbn').value.replace(/[-\s]/g,'').trim();
    const next={...(prev||{}),id,title:$('fieldTitle').value.trim(),author:$('fieldAuthor').value.trim(),genre:$('fieldGenre').value.trim()||'Other',year:$('fieldYear').value?Number($('fieldYear').value):null,
      status:$('fieldStatus').value,progress:progress===''?null:Math.max(0,Math.min(100,Number(progress))),finishedOn:$('fieldFinished').value||'',rating:$('fieldRating').value?Number($('fieldRating').value):null,
      isbn,coverId:$('fieldCoverId').value.trim(),note:$('fieldNote').value.trim(),reflection:$('fieldReflection').value.trim(),featured:$('fieldFeatured').checked,color:prev?.color||'sage'};
    if(!next.title||!next.author)return;
    if(prev)books=books.map(b=>b.id===id?next:b);else books.push(next);
    persistDraft();closeEditor();renderAll();
  }
  editorInit();renderAll();
  // Keep the page navigation quiet and unobtrusive.
  const sections=[...document.querySelectorAll('main > section[id]')];
  if('IntersectionObserver'in window){const watcher=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.dataset.nav===entry.target.id))})},{rootMargin:'-26% 0px -57% 0px',threshold:0});sections.forEach(s=>watcher.observe(s))}
})();
