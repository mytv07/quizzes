let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = '';

  q.options.forEach((option, index) => {
    const btn = document.createElement('div');
    btn.classList.add('option');
    btn.textContent = option;
    btn.addEventListener('click', () => selectAnswer(index));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(index) {
  const correct = questions[currentQuestion].answer;
  if (index === correct) {
    score++;
  }
  nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
    nextBtn.style.display = 'none';
  } else {
    localStorage.setItem('quizScore', score);
    window.location.href = 'result.html';
  }
});

document.addEventListener('DOMContentLoaded', showQuestion);
