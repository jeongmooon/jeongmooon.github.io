const menus = {
  STUDY: {
    '1-WEEK': ['HTML', 'HTTP','HTTPS','REQUEST&RESPONSE','URL&URI','NAT'],
    '2-WEEK': ['DATABASE','DBMS','SQL','MINI-MISSION'],
    '3-WEEK': ['IDENTIFICATION-AUTHENTICATION','COOKIE-SESSION']
  },
  REPORT: {
    'REPORT1': ['LOGIN'],
    'REPORT2': ['REGISTER','MAIN']
  },
  ETC: {
    'REPORT': ['TABLE SCHEMA']
  }
};

marked.setOptions({
  langPrefix: 'language-',
  highlight: function(code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

const siteTitle = document.getElementById('site-title');
const subMenuEl = document.getElementById('sub-menu');
const detailMenuEl = document.getElementById('detail-menu');
const markdownMenuEl = document.getElementById('markdown-menu');
const viewer = document.getElementById('markdown-viewer');
const toggleBtn = document.getElementById('toggle-markdown');
const mainBolg = document.querySelector('.main-blog');
const main = document.querySelector('.main');

siteTitle.addEventListener('click', e =>{
  main.style.display='none';
  mainBolg.style.display = 'flex';
});

document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', () => {
    const menu = link.getAttribute('data-menu');
    const sub = menus[menu];
    main.style.display='flex';
    mainBolg.style.display = 'none';

    subMenuEl.innerHTML = `<h2>${menu}</h2><ul>` +
      Object.keys(sub).map(key => `<li data-menu="${menu}" data-sub="${key}">${key}</li>`).join('') + '</ul>';

    detailMenuEl.innerHTML = '';
    markdownMenuEl.innerHTML = '';
    viewer.innerHTML = '';

    // 화면 크기가 1024px 이하일 때만 동작
    if (window.innerWidth <= 1024) {
      // 마크다운 뷰어의 'show' 클래스 토글
      viewer.classList.remove('show');
      subMenuEl.classList.remove('hidden');
      detailMenuEl.classList.remove('hidden');
      subMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      subMenuEl.style.display = 'block';
      detailMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      detailMenuEl.style.display = 'block';
      viewer.style.display = 'none';

      toggleBtn.textContent = viewer.classList.contains('show') ? '📄 내용 숨기기' : '📄 내용 보기';
    }
  });
});

subMenuEl.addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    markdownMenuEl.innerHTML = '';
    const menu = e.target.getAttribute('data-menu');
    const sub = e.target.getAttribute('data-sub');

    const details = menus[menu][sub];

    detailMenuEl.innerHTML = `<h2>${sub}</h2><ul>` +
      details.map(name => `<li data-menu="${menu}" data-sub="${sub}" data-name="${name}" data-path="https://jeongmooon.github.io/markdowns/${menu.toLocaleLowerCase()}/${sub}/${name.toLocaleLowerCase()}.md">${name}</li>`).join('') + '</ul>';

    viewer.innerHTML = '';
  }
});

detailMenuEl.addEventListener('click', async e => {
  if (e.target.tagName === 'LI') {
    const path = e.target.getAttribute('data-path');

    try {
      const res = await fetch(path);

      if(res.status !== 200){
        return viewer.innerHTML = '<p style="color:red;">❌ 마크다운 로딩 실패</p>';
      }
      const text = await res.text();
      const processedText = text.replace(/==(.+?)==/g, '<span class="underline-double">$1</span>');;      
      viewer.innerHTML = marked.parse(processedText);

      addHeadingIds();
      hljs.highlightAll();
      addCopyButtons();

      const pathNameArr = new URL(path).pathname.split('/');
      window.location.hash = `${pathNameArr[2]}.${pathNameArr[3]}.${pathNameArr[4].split('.')[0]}`;

      markdownMenuEl.innerHTML = `<h2>${pathNameArr[4].split('.')[0].toUpperCase()}</h2><ul>`+
      [...viewer.querySelectorAll("h2")].map(h2 => `<li onclick="scrollToHeading('${h2.textContent}')">${h2.textContent}</li>`).join('') + '</ul>';
      
    } catch(e) {
      console.log(e)
      viewer.innerHTML = '<p style="color:red;">❌ 마크다운 로딩 실패</p>';
    }
  }
});

function addCopyButtons() {
  const codeBlocks = viewer.querySelectorAll('pre > code');

  codeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;

    // 이미 버튼이 있는 경우 중복 추가 방지
    if (pre.querySelector('.copy-btn')) return;

    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerText = '📋 복사';
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        button.innerText = '✅ 복사됨!';
        setTimeout(() => {
          button.innerText = '📋 복사';
        }, 1500);
      });
    });

    // pre 태그에 relative 포지션 지정
    pre.style.position = 'relative';
    pre.appendChild(button);
  });
}

function addHeadingIds() {
  const headings = viewer.querySelectorAll('h2');
  headings.forEach(heading => {
    const text = heading.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    heading.id = text;
  });
}

function scrollToHeading(text) {
  const targetId = text.trim().toLowerCase().replace(/\s+/g, '-');
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    alert(`"${text}" 제목을 찾을 수 없습니다.`);
  }
}


// '내용 보기' / '내용 숨기기' 버튼 클릭 시 동작
toggleBtn.addEventListener('click', () => {
  // 화면 크기가 1024px 이하일 때만 동작
  if (window.innerWidth <= 1024) {
    //
    if(viewer.innerHTML === '') return;
    // 마크다운 뷰어의 'show' 클래스 토글
    viewer.classList.toggle('show');
    
    // 서브메뉴들 'hidden' 클래스 토글
    subMenuEl.classList.toggle('hidden');
    detailMenuEl.classList.toggle('hidden');
    
    // 버튼 텍스트 변경
    toggleBtn.textContent = viewer.classList.contains('show') ? '📄 내용 숨기기' : '📄 내용 보기';

    // 마크다운 뷰어가 보일 때 서브메뉴 숨기기 애니메이션 추가
    if (viewer.classList.contains('show')) {
      subMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      subMenuEl.style.display = 'none';
      detailMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      detailMenuEl.style.display = 'none';
      viewer.style.display = 'block';
    } else {
      subMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      subMenuEl.style.display = 'block';
      detailMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      detailMenuEl.style.display = 'block';
      viewer.style.display = 'none';
    }
  }
});

function clickAsync(selector) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (!el) return reject(`Element not found: ${selector}`);

    const handler = () => {
      el.removeEventListener('click', handler);
      resolve();
    };

    el.addEventListener('click', handler);
    el.click();
  });
}

window.addEventListener('DOMContentLoaded',async function()
{
  const hashArr = window.location.hash.replace("#","").split(".");
  if(hashArr.length > 0 && hashArr[0] !== ''){
    try {
      await clickAsync(`.menu-link[data-menu="${hashArr[0].toUpperCase()}"]`);
      await clickAsync(`[data-sub="${hashArr[1].toUpperCase()}"]`);
      await clickAsync(`[data-name="${hashArr[2].toUpperCase()}"]`);
    } catch (e) {
      console.error(e);
    }
  }
});

// 화면 크기 변경 시 처리
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    // 화면 크기가 1024px을 초과하면 마크다운 뷰어와 서브메뉴가 항상 보이게 설정
    viewer.classList.remove('show');
    subMenuEl.classList.remove('hidden');
    detailMenuEl.classList.remove('hidden');
    toggleBtn.textContent = '📄 내용 보기';
  }
});

