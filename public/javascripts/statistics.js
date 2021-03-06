const resetButton = document.querySelector( '.reset' )

if( resetButton !== null ) {
  resetButton.addEventListener( 'click', event => {
    event.target.disabled = true
    event.preventDefault()

    fetch( '/stats/calculate/current', { method: 'post', credentials: 'include' })
      .then( result => result.json() )
      .then( _ => window.location.reload( true ))
  })
}

const load = () =>
  fetch( '/stats/current', { method: 'get', credentials: 'include' })
    .then( result => result.json() )
    .then( result => {
      render( result )

      socket.emit( 'join', '/stats' )
      socket.on( 'update', render )
    })

const render = ({ statistics, coachStats }) => {
  renderStatistics( statistics )
  renderCoachStats( coachStats )
}

const renderStatistics = ({ longest_wait, average_wait_time, total_wait, total_claims }) => {
  const container = document.querySelector( '.statistics' )

  container.innerHTML = `
    <div class="col-md-6">
      <table class="table table-striped">
        <tbody>
          <tr>
            <td>Longest Wait Time:</td>
            <td>${moment.duration( longest_wait, 'seconds' ).humanize()}</td>
          </tr>
          <tr>
            <td>Average Wait Time:</td>
            <td>
              ${moment.duration( average_wait_time, 'seconds' ).humanize()}
              (total wait time ${total_wait} seconds / ${total_claims} claims)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-md-6">
    </div>
  `
}

const renderCoachStats = coachStats => {
  const container = document.querySelector( '.coach-statistics' )

  container.innerHTML = `
    <div class="col-md-6">
      <table class="table table-striped">
        <thead><tr><th>Coach</th><th>Primary</th><th>Communal</th></tr></thead>
        <tbody>
          ${coachStats.map( coachRow ).join('\n')}
        </tbody>
      </table>
    </div>
    <div class="col-md-6">
    </div>
  `
}

const coachRow = coach => {
  return `
    <tr>
      <td>${coach.handle}</td>
      <td>${coach.primary}</td>
      <td>${coach.communal}</td>
    </tr>
  `
}

load()