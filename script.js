const menus = {
  STUDY: {
    '1-WEEK': ['HTML', 'HTTP','HTTPS','REQUEST&RESPONSE','URL&URI','NAT'],
    '2-WEEK': ['JavaScript'],
    '3-WEEK': ['Project']
  },
  REPORT: {
    'Report1': ['Overview'],
    'Report2': ['Data']
  },
  ETC: {
    'Memo': ['Info']
  }
};

const subMenuEl = document.getElementById('sub-menu');
const detailMenuEl = document.getElementById('detail-menu');
const viewer = document.getElementById('markdown-viewer');
const toggleBtn = document.getElementById('toggle-markdown');

document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', () => {
    const menu = link.getAttribute('data-menu');
    const sub = menus[menu];

    subMenuEl.innerHTML = `<h2>${menu}</h2><ul>` +
      Object.keys(sub).map(key => `<li data-menu="${menu}" data-sub="${key}">${key}</li>`).join('') + '</ul>';

    detailMenuEl.innerHTML = '';
    viewer.innerHTML = '';
  });
});

subMenuEl.addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    const menu = e.target.getAttribute('data-menu');
    const sub = e.target.getAttribute('data-sub');

    const details = menus[menu][sub];

    detailMenuEl.innerHTML = `<h2>${sub}</h2><ul>` +
      details.map(name => `<li data-menu="${menu}" data-sub="${sub}" data-name="${name}" data-path="https://jeongmooon.github.io/markdowns/${menu}/${sub.toLocaleLowerCase()}/${name.toLocaleLowerCase()}.md">${name}</li>`).join('') + '</ul>';

    viewer.innerHTML = '';
  }
});

detailMenuEl.addEventListener('click', async e => {
  if (e.target.tagName === 'LI') {
    const path = e.target.getAttribute('data-path');

    try {
      const res = await fetch(path);
      const text = await res.text();
      viewer.innerHTML = marked.parse(text);
    } catch {
      viewer.innerHTML = '<p style="color:red;">❌ 마크다운 로딩 실패</p>';
    }
  }
});

// '내용 보기' / '내용 숨기기' 버튼 클릭 시 동작
toggleBtn.addEventListener('click', () => {
  // 화면 크기가 1024px 이하일 때만 동작
  if (window.innerWidth <= 1024) {
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
      detailMenuEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
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
