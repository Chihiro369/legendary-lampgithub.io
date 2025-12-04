// 予約データ（実運用はDB）
let reservations = {};

const MAX_PER_HOUR = 5;
const MAX_PER_DAY = 5;

// --------------------------
//   日付の最大を 1ヶ月先に
// --------------------------
const dateInput = document.getElementById("date");
const today = new Date();
const maxDate = new Date();
maxDate.setMonth(today.getMonth() + 1);

dateInput.min = today.toISOString().split("T")[0];
dateInput.max = maxDate.toISOString().split("T")[0];

dateInput.addEventListener("change", generateTimeSlots);

// --------------------------
//   時間枠生成
// --------------------------
function generateTimeSlots() {
  const date = dateInput.value;
  const timeSelect = document.getElementById("time");
  timeSelect.innerHTML = "";

  if (!date) return;

  const dailyTotal = reservations[date]?.total || 0;
  if (dailyTotal >= MAX_PER_DAY) {
    const opt = document.createElement("option");
    opt.textContent = "満枠";
    timeSelect.appendChild(opt);
    return;
  }

  const hours = [
    "09:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00","17:00"
  ];

  hours.forEach(time => {
    const count = reservations[date]?.[time] || 0;
    const option = document.createElement("option");

    if (count >= MAX_PER_HOUR) {
      option.textContent = `${time} ×`;
      option.disabled = true;
    } else {
      option.textContent = time;
      option.value = time;
    }
    timeSelect.appendChild(option);
  });
}

// --------------------------
//   合計金額計算
// --------------------------
function updateTotal() {
  const plan = Number(document.getElementById("plan").value);
  const options = document.querySelectorAll(".opt:checked");

  let total = plan;
  options.forEach(opt => total += Number(opt.value));

  document.getElementById("total").textContent = total;
}

document.getElementById("plan").addEventListener("change", updateTotal);
document.querySelectorAll(".opt").forEach(opt =>
  opt.addEventListener("change", updateTotal)
);

updateTotal(); // 初期表示

// --------------------------
//   予約処理
// --------------------------
document.getElementById("booking-form").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const plan = document.getElementById("plan").value;
  const option = document.getElementById("option").value;
  const total = document.getElementById("total-price").textContent;
  const note = document.getElementById("note").value;

  fetch("https://script.google.com/macros/s/AKfycbyziJQbb0VziIyT33C63nmFoEyPeE13WVaR5tIfLZLHGi2EPnXObyNjZvdq4ukIpOWv/exec", {
    method: "POST",
    body: JSON.stringify({
      name, email, date, time, plan, option, total, note
    })
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "success") {
      alert("予約が送信されました！");
    } else {
      alert("サーバーエラー");
    }
  })
  .catch(err => {
    alert("通信エラーが発生しました");
    console.error(err);
  });
});

