/** Reducing-balance EMI, monthly compounding. Values rounded to 2 decimals for display/storage. */
export function calculateLoan(price,downPercent,years,annualRate){
  if (![price,downPercent,years,annualRate].every(Number.isFinite)||price<=0||downPercent<0||downPercent>100||!Number.isInteger(years)||years<1||years>6||annualRate<0||annualRate>50) throw new Error('Invalid loan parameters');
  const downPaymentAmount=price*downPercent/100;
  const principal=price-downPaymentAmount;
  const n=years*12;
  const r=annualRate/1200;
  const monthlyInstallment=principal===0?0:r===0?principal/n:principal*r/(1-Math.pow(1+r,-n));
  const totalRepayment=monthlyInstallment*n;
  const round=(v)=>Math.round((v+Number.EPSILON)*100)/100;
  return {downPaymentAmount:round(downPaymentAmount),principal:round(principal),monthlyInstallment:round(monthlyInstallment),totalInterest:round(Math.max(0,totalRepayment-principal)),totalRepayment:round(totalRepayment),annualInterestRate:annualRate,downPaymentPercent:downPercent,tenureYears:years};
}
