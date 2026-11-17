import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyRepairRequest } from '../src/triage.js';

test('gas smell in English is an emergency', () => {
  assert.equal(
    classifyRepairRequest({ description: 'There is a gas smell in the hallway', category: 'other' }),
    'emergency',
  );
});

test('gas smell is an emergency, also when the tenant writes Dutch', () => {
  assert.equal(
    classifyRepairRequest({ description: 'Gaslucht in de keuken', category: 'heating' }),
    'emergency',
  );
});

test('heating problem without emergency keywords is urgent', () => {
  assert.equal(
    classifyRepairRequest({ description: 'Radiator in bedroom stays cold', category: 'heating' }),
    'urgent',
  );
});

test('vulnerable tenant makes a normal request urgent', () => {
  assert.equal(
    classifyRepairRequest({ description: 'Leaking tap', category: 'plumbing', vulnerableTenant: true }),
    'urgent',
  );
});

test('leaking tap is normal', () => {
  assert.equal(
    classifyRepairRequest({ description: 'Leaking tap in the bathroom', category: 'plumbing' }),
    'normal',
  );
});

test('empty description is rejected', () => {
  assert.throws(() => classifyRepairRequest({ description: '   ' }), TypeError);
});

// Backlog for part 5. Remove ".skip" to switch a test on.

test.skip('category ignores case and extra spaces', () => {
  assert.equal(
    classifyRepairRequest({ description: 'Radiator stays cold', category: ' Heating ' }),
    'urgent',
  );
});

test.skip('no hot water is urgent, also in Dutch', () => {
  assert.equal(
    classifyRepairRequest({ description: 'No hot water in the shower', category: 'other' }),
    'urgent',
  );
  assert.equal(
    classifyRepairRequest({ description: 'Geen warm water sinds gisteren', category: 'other' }),
    'urgent',
  );
});

test.skip('descriptions longer than 2000 characters are rejected', () => {
  assert.equal(classifyRepairRequest({ description: 'x'.repeat(2000) }), 'normal');
  assert.throws(() => classifyRepairRequest({ description: 'x'.repeat(2001) }), TypeError);
});
