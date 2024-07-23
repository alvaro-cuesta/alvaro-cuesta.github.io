const { expect } = require("@jest/globals");
const { Temporal } = require("temporal-polyfill");

function areTemporalPlainYearMonthsEqual(a, b) {
  const isATemporalPlainYearMonth = a instanceof Temporal.PlainYearMonth;
  const isBTemporalPlainYearMonth = b instanceof Temporal.PlainYearMonth;

  if (isATemporalPlainYearMonth && isBTemporalPlainYearMonth) {
    return a.equals(b);
  } else if (isATemporalPlainYearMonth === isBTemporalPlainYearMonth) {
    return undefined;
  } else {
    return false;
  }
}

function areTemporalPlainDatesEqual(a, b) {
  const isATemporalPlainDate = a instanceof Temporal.PlainDate;
  const isBTemporalPlainDate = b instanceof Temporal.PlainDate;

  if (isATemporalPlainDate && isBTemporalPlainDate) {
    return a.equals(b);
  } else if (isATemporalPlainDate === isBTemporalPlainDate) {
    return undefined;
  } else {
    return false;
  }
}

function areTemporalPlainDateTimesEqual(a, b) {
  const isATemporalPlainDateTime = a instanceof Temporal.PlainDateTime;
  const isBTemporalPlainDateTime = b instanceof Temporal.PlainDateTime;

  if (isATemporalPlainDateTime && isBTemporalPlainDateTime) {
    return a.equals(b);
  } else if (isATemporalPlainDateTime === isBTemporalPlainDateTime) {
    return undefined;
  } else {
    return false;
  }
}

expect.addEqualityTesters([
  areTemporalPlainYearMonthsEqual,
  areTemporalPlainDatesEqual,
  areTemporalPlainDateTimesEqual,
]);
