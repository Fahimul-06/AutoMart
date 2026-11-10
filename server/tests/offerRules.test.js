import test from 'node:test';
import assert from 'node:assert/strict';
import {nextOfferPolicy,SELECTION_PAYMENT_MS} from '../src/utils/offerRules.js';
const start=Date.parse('2026-11-10T00:00:00Z');
test('first offer is immediately allowed',()=>assert.deepEqual(nextOfferPolicy(null,start),{allowed:true,attempt:1,nextAt:null}));
test('second offer requires four hours from first submission',()=>{
 const last={attempt:1,createdAt:new Date(start)};
 assert.equal(nextOfferPolicy(last,start+4*3600000-1).allowed,false);
 assert.equal(nextOfferPolicy(last,start+4*3600000).attempt,2);
 assert.equal(nextOfferPolicy(last,start+4*3600000).allowed,true);
});
test('third offer requires six hours from second submission',()=>{
 const last={attempt:2,createdAt:new Date(start)};
 assert.equal(nextOfferPolicy(last,start+6*3600000-1).allowed,false);
 assert.equal(nextOfferPolicy(last,start+6*3600000).attempt,3);
});
test('fourth offer is never permitted',()=>assert.equal(nextOfferPolicy({attempt:3,createdAt:new Date(start)},start+100*3600000).reason,'limit'));
test('selection payment window is three hours',()=>assert.equal(SELECTION_PAYMENT_MS,3*60*60*1000));
