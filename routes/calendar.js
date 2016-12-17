const express = require('express')
const router = express.Router()
const gcal = require('google-calendar')
const moment = require('moment')
const {findFreeSchedule, findNextAppointment} = require('../models/appointment')
const {createAppointment} = require('../io/database/appointments')

router.all('/', (req, res) => {
  const accessToken = req.session.access_token

  gcal(accessToken).calendarList.list((err, data) => 
    err ? res.send(500,err) : res.json(data)
  )
})

router.all('/:calendarId', (req, res) => {
  const { access_token } = req.session;
  const google_calendar = gcal(access_token)
  const { calendarId } = req.params;
  const endOfToday = moment().startOf('day').add({h:17.5})
  const startOfToday = moment().startOf('day').add({h:9})

  let endOfDay = moment() > endOfToday
    ? moment().endOf('day').add({h:17.5, ms:1})
    : endOfToday

  let startOfDay = moment().isBetween(endOfToday, moment().endOf('day')) 
    ? moment().endOf('day').add({h:9, ms:1})
    : startOfToday

  google_calendar.freebusy.query( 
  { 
    items: [{id:`${calendarId}`}],
    timeMin: startOfDay, 
    timeMax: endOfDay
  }, (err, data) => {
    if (err) { return res.send(500, err) }

    let busyTime = data.calendars[calendarId].busy
    const freeTimeSlots = findFreeSchedule(busyTime)
    // console.log('freeTimeSlots', freeTimeSlots)
    Promise.resolve(findFreeSchedule(busyTime))
      .then(freeApptTimes => {
        console.log('freeApptTimes', freeApptTimes)
        return findNextAppointment(freeApptTimes)
      })
      .then( aptData => {
        console.log('hi',aptData)

        let aptStart = aptData.start//.toDate()
        let aptEnd = aptData.end//.toDate()
        let event = {
          'summary': 'Coaching session with Somebody',
          'description': 'Go get \'em champ',
          'start': {
            'dateTime': aptStart,
            'timeZone': 'America/Los_Angeles'
          },
          'end': {
            'dateTime': aptEnd,
            'timeZone': 'America/Los_Angeles'
          }
        }
        console.log('event', event)

        google_calendar.events.insert(calendarId, event, (err, data) => {
          if (err) { return res.send(500, err) }

          console.log('data after gcal inser', data)
          createAppointment({
            appointment_start: data.start.dateTime,
            appointment_end: data.end.dateTime,
            coach_handle: 'imaleafyplant',
            appointment_length: 30,
            description: 'Please help.',
            mentee_handles: [ 'luvlearning', 'cupofjoe', 'codeandstuff' ]
          }).then(databaseData => {
              console.log('databaseData', databaseData)
              return res.json(databaseData)
            })
      })
      .catch(err => res.json(err))

      })
      
  })
})

module.exports = router