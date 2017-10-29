(() => {
  'use strict'

  const now = new Date();
  const currentJobSart = new Date(2017, 9);
  const $currentJobPeriod = document.querySelector('#current.duration');

  const getHumanizeDuration = (from, to) =>  moment.duration(to - from).humanize()

  $currentJobPeriod.innerHTML = `(${getHumanizeDuration(currentJobSart, now)})`;
})()