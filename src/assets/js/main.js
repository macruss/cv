(() => {
  'use strict'

  const now = new Date();
  const currentJobSart = new Date(2017, 10, 1);
  const $currentJobPeriod = document.querySelector('#current.duration');

  const makePlural = (str, count) => `${str}${count > 1 ? 's' : '' }`

  const getHumanizeDuration = (from, to) =>  {
    const duration = moment.duration(to - from)
    const yearsCount = duration.years()
    const monthsCount = duration.months()
    const daysCount = duration.days()

    return `${yearsCount} ${makePlural('year', yearsCount)} ` + 
    `${monthsCount} ${makePlural('month', monthsCount)} ` + 
    `${daysCount} ${makePlural('day', daysCount)}`
  }

  $currentJobPeriod.innerHTML = `(${getHumanizeDuration(currentJobSart, now)})`;
})()