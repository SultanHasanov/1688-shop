import dayjs from 'dayjs';

// Рассчитываем равные ежемесячные платежи (аннуитетно), с учётом первого взноса.
// sum: общая сумма покупки
// months: срок в месяцах
// ratePercent: годовая процентная ставка в процентах (например 12)
// firstPayment: сумма первого взноса (включается в расчёт)
export function generateSchedule({ sum, months, ratePercent = 0, firstPayment = 0, startDate = null }) {
  const principal = Number(sum) - Number(firstPayment || 0);
  const monthsN = Number(months);
  const monthlyRate = (Number(ratePercent) / 100) / 12;
  const schedule = [];

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / monthsN;
  } else {
    // аннуитетная формула
    const factor = Math.pow(1 + monthlyRate, monthsN);
    monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  }

  monthlyPayment = Number(monthlyPayment.toFixed(2));
  let balance = principal;

  const start = startDate ? dayjs(startDate) : dayjs();

  for (let i = 1; i <= monthsN; i++) {
    // процент за период:
    let interest = Number((balance * monthlyRate).toFixed(2));
    let principalPart = Number((monthlyPayment - interest).toFixed(2));
    if (i === monthsN) {
      // последний платёж — подгонка остатка
      principalPart = Number(balance.toFixed(2));
      monthlyPayment = Number((principalPart + interest).toFixed(2));
    }
    const dueDate = start.add(i - 1, 'month').startOf('day').toISOString();
    schedule.push({
      id: `${i}`, // временный id
      month: i,
      dueDate,
      amount: monthlyPayment,
      principalPart,
      interest,
      paid: false,
      paidAt: null,
      balanceAfter: Number((balance - principalPart).toFixed(2)),
      edits: [], // история правок платежа
    });
    balance = Number((balance - principalPart).toFixed(2));
  }

  return {
    firstPayment: Number(firstPayment || 0).toFixed(2),
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalToPay: Number((Number(firstPayment || 0) + monthlyPayment * monthsN).toFixed(2)),
    schedule,
  };
}

// Перерасчет при досрочном полном погашении
// remainingBalance: сумма на момент досрочного погашения
// При условии простого подхода: уменьшение процентов пропорционально оставшемуся сроку
export function recalcForEarlyPayoff({ remainingBalance, remainingMonths, ratePercent = 0 }) {
  // Для простоты считаем проценты за одну оставшуюся итерацию и списываем их пропорционально.
  // В реальной финансовой системе логика может быть сложнее (комиссии, штрафы и т.п.)
  const monthlyRate = (Number(ratePercent) / 100) / 12;
  const interest = Number((remainingBalance * monthlyRate).toFixed(2));
  // Возвращаем сумму, которую нужно внести сейчас для полного погашения:
  return Number((remainingBalance + interest).toFixed(2));
}
