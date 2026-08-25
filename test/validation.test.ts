import { expect } from 'chai';

import {
  dayRange,
  resolveDateRange,
  validateDateRange,
  validateEmail,
  validateImportFile,
} from '../dist/utils/validation.js';

describe('input validation', () => {
  it('builds half-open calendar-day ranges in the requested timezone', () => {
    expect(dayRange('2026-08-24', 'Asia/Shanghai')).to.deep.equal({
      endDate: '2026-08-24T16:00:00.000Z',
      startDate: '2026-08-23T16:00:00.000Z',
    });
    expect(dayRange('2026-03-08', 'America/New_York')).to.deep.equal({
      endDate: '2026-03-09T04:00:00.000Z',
      startDate: '2026-03-08T05:00:00.000Z',
    });
  });

  it('requires explicit timezone information and ordered ranges', () => {
    expect(() => validateDateRange('2026-08-24T00:00:00')).to.throw('explicit timezone');
    expect(() =>
      validateDateRange('2026-08-25T00:00:00+08:00', '2026-08-24T00:00:00+08:00')
    ).to.throw('earlier than end date');
    expect(() => resolveDateRange({
      date: '2026-08-24', startDate: '2026-08-24T00:00:00+08:00', timeZone: 'Asia/Shanghai',
    })).to.throw('cannot be combined');
  });

  it('rejects malformed emails and unsupported import files', () => {
    expect(() => validateEmail('not-an-email')).to.throw('invalid');
    expect(() => validateImportFile('users.json')).to.throw('.csv or .xlsx');
    expect(validateImportFile('users.CSV')).to.equal('users.CSV');
  });
});
