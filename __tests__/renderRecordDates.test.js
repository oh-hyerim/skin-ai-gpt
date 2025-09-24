/**
 * renderRecordDates 함수 단위 테스트
 * 
 * 실행 전 필요한 설정:
 * 1. Jest 및 jsdom 설치: npm install --save-dev jest jsdom @testing-library/jest-dom
 * 2. package.json에 test 스크립트 추가: "test": "jest"
 * 3. jest.config.js 생성하여 jsdom 환경 설정
 */

// Jest + jsdom 환경에서 renderRecordDates 함수를 테스트하기 위해
// 함수를 직접 정의하거나 모듈로 분리된 버전을 import해야 합니다.
// 현재는 public/index.js에 전역 함수로 정의되어 있어 직접 복사하여 테스트합니다.

// renderRecordDates 함수 (테스트용 복사본)
function renderRecordDates(labels) {
  if (!Array.isArray(labels)) {
    console.warn('renderRecordDates: labels must be an array', labels);
    return;
  }
  const el = document.getElementById('recordDates');
  if (!el) return;

  el.setAttribute('role', 'list');
  el.innerHTML = '';
  labels.forEach(text => {
    const s = document.createElement('span');
    s.setAttribute('role', 'listitem');
    s.textContent = String(text ?? '');
    el.appendChild(s);
  });
}

describe('renderRecordDates', () => {
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '<div id="recordDates"></div>';
    // console.warn 스파이 설정
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // 스파이 정리
    jest.restoreAllMocks();
  });

  describe('정상 동작 테스트', () => {
    it('should render labels into #recordDates as spans with correct content', () => {
      const labels = ['2023-01', '2023-02', '2023-03'];
      renderRecordDates(labels);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(spans.length).toBe(3);
      expect(spans[0].textContent).toBe('2023-01');
      expect(spans[1].textContent).toBe('2023-02');
      expect(spans[2].textContent).toBe('2023-03');
    });

    it('should set accessibility attributes correctly', () => {
      const labels = ['Jan', 'Feb'];
      renderRecordDates(labels);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(container.getAttribute('role')).toBe('list');
      expect(spans[0].getAttribute('role')).toBe('listitem');
      expect(spans[1].getAttribute('role')).toBe('listitem');
    });

    it('should handle empty array gracefully', () => {
      renderRecordDates([]);
      
      const container = document.getElementById('recordDates');
      expect(container.children.length).toBe(0);
      expect(container.getAttribute('role')).toBe('list');
    });

    it('should handle null/undefined values in labels', () => {
      const labels = ['Jan', null, undefined, 'Feb', ''];
      renderRecordDates(labels);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(spans.length).toBe(5);
      expect(spans[0].textContent).toBe('Jan');
      expect(spans[1].textContent).toBe(''); // null -> ''
      expect(spans[2].textContent).toBe(''); // undefined -> ''
      expect(spans[3].textContent).toBe('Feb');
      expect(spans[4].textContent).toBe(''); // empty string
    });

    it('should clear previous content before rendering new labels', () => {
      const container = document.getElementById('recordDates');
      container.innerHTML = '<div>existing content</div>';
      
      renderRecordDates(['New', 'Content']);
      
      const spans = container.querySelectorAll('span');
      const divs = container.querySelectorAll('div');
      
      expect(spans.length).toBe(2);
      expect(divs.length).toBe(0); // 기존 내용 제거됨
      expect(container.textContent).toBe('NewContent');
    });
  });

  describe('오류 처리 테스트', () => {
    it('should handle null input gracefully and log warning', () => {
      renderRecordDates(null);
      
      const container = document.getElementById('recordDates');
      expect(container.children.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'renderRecordDates: labels must be an array', 
        null
      );
    });

    it('should handle undefined input gracefully and log warning', () => {
      renderRecordDates(undefined);
      
      const container = document.getElementById('recordDates');
      expect(container.children.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'renderRecordDates: labels must be an array', 
        undefined
      );
    });

    it('should handle string input gracefully and log warning', () => {
      renderRecordDates('not an array');
      
      const container = document.getElementById('recordDates');
      expect(container.children.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'renderRecordDates: labels must be an array', 
        'not an array'
      );
    });

    it('should handle number input gracefully and log warning', () => {
      renderRecordDates(123);
      
      const container = document.getElementById('recordDates');
      expect(container.children.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'renderRecordDates: labels must be an array', 
        123
      );
    });

    it('should handle missing container element gracefully', () => {
      // recordDates 요소 제거
      document.body.innerHTML = '';
      
      // 오류 없이 실행되어야 함
      expect(() => {
        renderRecordDates(['test']);
      }).not.toThrow();
      
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('타입 변환 테스트', () => {
    it('should convert numbers to strings', () => {
      renderRecordDates([1, 2, 3.14]);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(spans[0].textContent).toBe('1');
      expect(spans[1].textContent).toBe('2');
      expect(spans[2].textContent).toBe('3.14');
    });

    it('should convert boolean values to strings', () => {
      renderRecordDates([true, false]);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(spans[0].textContent).toBe('true');
      expect(spans[1].textContent).toBe('false');
    });

    it('should handle objects by converting to string', () => {
      renderRecordDates([{ date: '2023-01' }, [1, 2, 3]]);
      
      const container = document.getElementById('recordDates');
      const spans = container.querySelectorAll('span');
      
      expect(spans[0].textContent).toBe('[object Object]');
      expect(spans[1].textContent).toBe('1,2,3');
    });
  });
});

/*
Jest 설정 예시 (jest.config.js):

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'public/**/*.js',
    '!public/node_modules/**',
  ],
};

Jest 설정 파일 예시 (jest.setup.js):

import '@testing-library/jest-dom';

// 전역 DOM 설정
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
});
*/
