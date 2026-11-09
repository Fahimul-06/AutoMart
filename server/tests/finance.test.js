import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateLoan} from '../src/utils/finance.js';
test('zero interest gives straight principal divided by payments',()=>{const x=calculateLoan(3000000,20,5,0);assert.equal(x.downPaymentAmount,600000);assert.equal(x.principal,2400000);assert.equal(x.monthlyInstallment,40000);assert.equal(x.totalInterest,0);});
test('reducing balance EMI is correct',()=>{const x=calculateLoan(3000000,20,5,10);assert.equal(x.downPaymentAmount,600000);assert.equal(x.principal,2400000);assert.ok(Math.abs(x.monthlyInstallment-50992.91)<.1);assert.ok(x.totalInterest>0);});
test('full down payment has zero EMI',()=>{const x=calculateLoan(3000000,100,5,10);assert.equal(x.monthlyInstallment,0);});
test('reject invalid parameters',()=>{assert.throws(()=>calculateLoan(100,10,0,10));assert.throws(()=>calculateLoan(100,101,5,10));});
